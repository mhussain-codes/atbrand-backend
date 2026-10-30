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
  '/stitching',
  '/new-arrivals',
  '/about',
  '/contact',
  '/size-guide',
  '/shipping-policy',
  '/return-policy'
];

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

staticRoutes.forEach(r => {
  xml += `  <url>\n    <loc>${escapeXml(`${base}${r}`)}</loc>\n  </url>\n`;
});

PRODUCTS.forEach(p => {
  xml += `  <url>\n    <loc>${escapeXml(`${base}/product/${p.id}`)}</loc>\n  </url>\n`;
});

xml += '</urlset>\n';

fs.writeFileSync(path.resolve('apps/web/public/sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${staticRoutes.length + PRODUCTS.length} total URLs.`);
