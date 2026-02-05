# LeadOS - Base Template Usage

Esta carpeta `LeadOS` está diseñada para funcionar como una **Plantilla Base (White Label)**.
La arquitectura ha sido refactorizada para que toda la lógica específica del cliente resida en archivos de configuración, separando el "Core" de la "Personalización".

## Cómo crear un nuevo Cliente

1. **Duplicar la Carpeta**:
   Copia toda la carpeta `LeadOS` y renómbrala, ej: `LeadOS_Cliente_Gimnasios`.

2. **Editar Configuración**:
   Abre `config/project.ts`. Este es el **ÚNICO** archivo que necesitas tocar para adaptar el sistema.

   ```typescript
   export const PROJECT_CONFIG: ProjectConfig = {
     clientId: 'cli_002',
     clientName: 'Inmobiliaria Elite', // Nombre en el Header
     primaryColor: 'hsl(210, 100%, 50%)', // Azul corporativo
     targets: {
       icp: 'Propietarios de viviendas de lujo en Madrid', // Placeholder del buscador
       locations: ['Madrid', 'Pozuelo'],
     },
     enabledPlatforms: ['linkedin', 'gmaps'], // Botones disponibles (IG se oculta)
     // ...
   };
   ```

3. **Ejecutar**:
   `npm run dev`
   
   ¡El sistema se adaptará automáticamente!
   - El título del Dashboard cambiará.
   - El input de búsqueda mostrará el nuevo ICP.
   - Solo aparecerán los botones de LinkedIn y Maps.
   - (Futuro) Los agentes de IA usarán el contexto del ICP para generar mensajes.

## Estructura de Archivos

- `config/`: Configuraciones específicas del cliente.
- `services/`: Lógica de negocio (Búsqueda, IA) independiente de la UI.
- `components/`: UI "tonta" que lee la configuración.
- `lib/`: Tipos y datos base.

## Extender el Sistema

Si necesitas añadir una nueva plataforma (ej: TikTok):
1. Añádela a `PlatformSource` en `lib/types.ts`.
2. Actualiza `components/SearchConfig.tsx` para incluir el icono.
3. Actualiza `services/search/SearchService.ts` para manejar la lógica de esa plataforma.
