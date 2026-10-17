import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { allPages, applyMeta, sitemapXml } from './src/seo';

// Writes one HTML file per page (so each tool has its own title and meta for
// search engines and link previews), a 404.html SPA fallback, and sitemap.xml.
function seoPages(): Plugin {
  return {
    name: 'toolglass-seo-pages',
    apply: 'build',
    closeBundle() {
      const dist = 'dist';
      const shell = readFileSync(join(dist, 'index.html'), 'utf8');
      const pages = allPages();
      for (const page of pages) {
        // GitHub Pages serves /tools/json from tools/json.html without a redirect
        const file = page.path.endsWith('/') ? `${page.path.slice(1)}index.html` : `${page.path.slice(1)}.html`;
        mkdirSync(dirname(join(dist, file)), { recursive: true });
        writeFileSync(join(dist, file), applyMeta(shell, page));
      }
      writeFileSync(join(dist, '404.html'), shell.replace('<head>', '<head>\n    <meta name="robots" content="noindex" />'));
      writeFileSync(join(dist, 'sitemap.xml'), sitemapXml(pages));
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,woff2}'] },
      manifest: {
        name: 'Toolglass',
        short_name: 'Toolglass',
        description: 'Frosted developer utilities. entirely in your browser.',
        theme_color: '#f3e7ff',
        background_color: '#f8fafc',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    seoPages(),
  ],
  build: { target: 'es2022', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
