import React, { useState } from 'react';
import { X, Copy, Check, Wand2 } from 'lucide-react';
import { Lead } from '../lib/types';

interface MessageModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function MessageModal({ lead, onClose }: MessageModalProps) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lead.aiAnalysis.fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Borrador de Mensaje IA</h3>
              <p className="text-xs text-muted-foreground">Destinatario: {lead.decisionMaker?.name} @ {lead.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid gap-6">
           {/* Strategy Insight */}
           <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Estrategia de Análisis</h4>
              <div className="flex flex-wrap gap-2">
                 {lead.aiAnalysis.painPoints.map((point, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">
                       ⚠ {point}
                    </span>
                 ))}
                 <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                    ★ Gancho: {lead.aiAnalysis.generatedIcebreaker.substring(0, 30)}...
                 </span>
              </div>
           </div>

           {/* Message Body */}
           <div className="relative">
              <div className="absolute top-0 right-0 p-2 z-10">
                 <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:text-primary transition-all shadow-sm"
                 >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado' : 'Copiar Texto'}
                 </button>
              </div>
              <textarea 
                className="w-full h-80 bg-secondary/30 border border-input rounded-lg p-5 font-sans text-base leading-relaxed text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                value={lead.aiAnalysis.fullMessage}
                readOnly
              />
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Descartar
           </button>
           <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Aprobar y Enviar a CRM
           </button>
        </div>
      </div>
    </div>
  );
}
