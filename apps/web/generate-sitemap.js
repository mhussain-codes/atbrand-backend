import { PRODUCTS } from './src/data/products.js';
import fs from 'fs';
import path from 'path';

const base = 'https://atbrand.store';
const staticRoutes = [
  '',
  '/shop',
  '/men',
  '/men/ahmad-cotton',
  '/men/rashid-cotton',
  '/men/wash-and-wear',
  '/men/boski',
  '/men/khaddar',
  '/men/lattha',
  '/men/karandi',
  '/women',
  '/perfumes',
  '/stitching',
  '/new-arrivals',
  '/track-order',
  '/about',
  '/contact',
  '/size-guide',
  '/shipping-policy',
  '/return-policy',
  '/privacy-policy',
  '/terms'
];

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

staticRoutes.forEach(r => {
  const priority = r === '' ? '1.0' : r.startsWith('/men') || r === '/shop' ? '0.9' : '0.7';
  xml += `  <url>\n    <loc>${base}${r}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
});

PRODUCTS.forEach(p => {
  xml += `  <url>\n    <loc>${base}/product/${p.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

xml += '</urlset>\n';

fs.writeFileSync(path.resolve('apps/web/public/sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${staticRoutes.length + PRODUCTS.length} total URLs.`);
