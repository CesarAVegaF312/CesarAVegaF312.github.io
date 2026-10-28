import { defineConfig } from 'astro/config';
import avisoPresentaciones from './src/lib/aviso-presentaciones';

export default defineConfig({
  site: 'https://cesaravegaf312.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [avisoPresentaciones()],
});
