// import { ApifyClient } from 'apify-client'; // Removed strictly Node.js dependency
import { Lead, SearchConfigState } from '../../lib/types';
import { enrichLeadWithEmail } from '../../lib/emailScraper';

export type LogCallback = (message: string) => void;
export type ResultCallback = (leads: Lead[]) => void;

// Aaron's Niche Filters
const TARGET_KEYWORDS = ['reformas', 'obras', 'instalad', 'construcc', 'rehabilitacion'];

export class SearchService {
    private isRunning = false;

    public stop() {
        this.isRunning = false;
    }

    public async startSearch(
        config: SearchConfigState,
        onLog: LogCallback,
        onComplete: ResultCallback
    ) {
        this.isRunning = true;
        const leads: Lead[] = [];

        try {
            onLog(`[INIT] Configurando cliente Apify(Browser Mode)...`);

            const apiKey = import.meta.env.VITE_APIFY_API_KEY || import.meta.env.APIFY_API_KEY;

            if (!apiKey) {
                throw new Error("Falta la API Key de Apify. Asegúrate de tener VITE_APIFY_API_KEY en tu .env");
            }

            // 1. Input Parsing & Validation
            const query = `${config.query} en España`; // Force Spain as per Aaron's rules
            onLog(`[BUSQUEDA] Iniciando scraping para: "${query}"(Max: ${config.maxResults})`);

            // 2. Call Google Maps Scraper Actor via REST API (Fetch)
            // We use fetch because apify-client is for Node.js
            const input = {
                searchStringsArray: [query],
                locationQuery: '',
                maxCrawlerConcurrency: 2,
                maxReviews: 0,
                maxImages: 0,
                scrapeReviewerName: false,
                scrapeReviewerId: false,
                scrapeReviewerUrl: false,
                scrapeReviewText: false,
                lang: 'es',
                maxWebPages: 1,
                maxScrolls: 10,
                zoom: 12,
                limit: config.maxResults || 20,
            };

            onLog(`[APIFY] Enviando petición HTTP al actor google - maps - scraper...`);

            // Start the actor
            const startUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${apiKey}`;
            const startResponse = await fetch(startUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });

            if (!startResponse.ok) {
                const err = await startResponse.text();
                throw new Error(`Error iniciando Apify: ${err}`);
            }

            const startData = await startResponse.json();
            const runId = startData.data.id;
            const defaultDatasetId = startData.data.defaultDatasetId;

            onLog(`[APIFY] Tarea iniciada (ID: ${runId}). Esperando resultados...`);

            // Poll for completion
            let isFinished = false;
            while (!isFinished && this.isRunning) {
                await new Promise(r => setTimeout(r, 5000)); // Wait 5s

                const statusUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/runs/${runId}?token=${apiKey}`;
                const statusRes = await fetch(statusUrl);
                const statusData = await statusRes.json();
                const status = statusData.data.status;

                onLog(`[APIFY] Estado: ${status}`);

                if (status === 'SUCCEEDED') {
                    isFinished = true;
                } else if (status === 'FAILED' || status === 'ABORTED') {
                    throw new Error(`El actor de Apify falló con estado: ${status}`);
                }
            }

            if (!this.isRunning) return;

            onLog(`[APIFY] Descargando resultados del Dataset: ${defaultDatasetId}...`);
            const itemsUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiKey}`;
            const itemsRes = await fetch(itemsUrl);
            const items = await itemsRes.json();

            onLog(`[PROCESAMIENTO] Obtenidos ${items.length} resultados crudos. Filtrando...`);

            let processedCount = 0;

            for (const item of items) {
                if (!this.isRunning) break;

                // --- AARON'S FILTERING RULES ---
                const rawTitle = (item.title as string || '').toLowerCase();
                const reviewsCount = item.reviewsCount || 0;

                // Rule: Discard 0 reviews
                if (reviewsCount === 0) {
                    continue; // Skip "Ghost companies"
                }

                // Rule: Focus on "Instaladores", "Reformas", "Obras"
                const titleMatches = TARGET_KEYWORDS.some(k => rawTitle.includes(k));
                const categoryMatches = (item.categoryName as string || '').toLowerCase();
                const isTarget = titleMatches || TARGET_KEYWORDS.some(k => categoryMatches.includes(k));

                if (!isTarget) {
                    // Filter or Keep? Implementation choice. keeping for now as Maps search is usually relevant.
                }

                // --- MAPPING ---
                const website = item.website as string;
                let decisionMaker = { name: '', role: '', email: '' };

                // --- ENRICHMENT (The "Email Hunter") ---
                if (website) {
                    onLog(`[EMAIL_HUNTER] Analizando ${website} para ${item.title}...`);
                    try {
                        const foundEmail = await enrichLeadWithEmail(website);
                        if (foundEmail) {
                            decisionMaker.email = foundEmail;
                            onLog(`[EMAIL_HUNTER] ¡Email encontrado! ${foundEmail}`);
                        } else if (item.email) {
                            decisionMaker.email = item.email as string;
                        }
                    } catch (e) {
                        console.error("Enrichment error", e);
                    }
                }

                if (!decisionMaker.email) {
                    // Check if Apify found it
                    const emails = item.emails as string[];
                    if (emails && emails.length > 0) decisionMaker.email = emails[0];
                }

                // Determine Status
                const status = decisionMaker.email ? 'enriched' : 'scraped';

                const lead: Lead = {
                    id: String(item.placeId || `lead-${Date.now()}-${processedCount}`),
                    source: 'gmaps',
                    companyName: item.title as string || 'Sin Nombre',
                    website: website,
                    socialUrl: undefined,
                    location: item.address as string,
                    decisionMaker: decisionMaker,
                    aiAnalysis: {
                        summary: `Empresa de ${item.categoryName || 'Reformas'} con ${reviewsCount} reseñas.`,
                        painPoints: [],
                        generatedIcebreaker: "",
                        fullMessage: ""
                    },
                    status: status as any
                };

                leads.push(lead);
                processedCount++;
            }

            onLog(`[FINALIZADO] Procesamiento completo. ${leads.length} leads cualificados encontrados.`);
            onComplete(leads);

        } catch (error: any) {
            console.error(error);
            onLog(`[ERROR] Fallo crítico: ${error.message}`);
            onComplete([]);
        } finally {
            this.isRunning = false;
        }
    }
}

export const searchService = new SearchService();

