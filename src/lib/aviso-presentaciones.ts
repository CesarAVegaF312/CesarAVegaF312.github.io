// Integración de Astro que, al construir o al iniciar el servidor de desarrollo,
// imprime la lista de presentaciones declaradas en los YAML que todavía no
// están en public/. Esas presentaciones no se muestran en el sitio.

import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { archivosFaltantes } from './datos';

function avisar(logger: AstroIntegrationLogger) {
  const faltantes = archivosFaltantes();
  if (faltantes.length === 0) {
    logger.info('Todas las presentaciones declaradas están en public/.');
    return;
  }
  logger.warn(
    [
      `Faltan ${faltantes.length} archivos de presentaciones. No se muestran en el sitio hasta que se suban:`,
      ...faltantes.map((ruta) => `  - ${ruta}`),
    ].join('\n'),
  );
}

export default function avisoPresentaciones(): AstroIntegration {
  return {
    name: 'aviso-presentaciones',
    hooks: {
      'astro:build:start': ({ logger }) => avisar(logger),
      'astro:server:start': ({ logger }) => avisar(logger),
    },
  };
}
