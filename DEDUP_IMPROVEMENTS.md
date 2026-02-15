# ✅ Anti-Duplicados: Arquitectura Mejorada

## Cambios en la lógica anti-duplicados (15/02/2026)

### Mejora Principal
El filtro de deduplicación global ahora está **dentro del loop de búsqueda**, no después:

✨ **Antes (Problema):**
- Búsquedas de 3 leads → Apify encuentra 3 → Filtra 2 duplicados DESPUÉS → Retorna 1 ❌

✨ **Ahora (Solución):**  
- Búsquedas de 3 leads → Apify encuentra candidatos → Filtra duplicados EN EL LOOP → Si faltan, continúa buscando → Retorna 3 ✅

### Cambios Implementados
- ✅ Deduplicación global **dentro del loop** (DeduplicationService.filterUniqueCandidates)
- ✅ Si todos los candidatos son duplicados → continúa el loop automáticamente
- ✅ Fallback: acepta leads sin email si no hay suficientes con email
- ✅ Logs detallados: candidatos con/sin email, rechazados por deduplicación
- ✅ Campo searchGmail() ahora recibe existingWebsites y existingCompanyNames

### Resultado
Búsquedas retornan la cantidad solicitada de leads sin duplicados repetitivos.
