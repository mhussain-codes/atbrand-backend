import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from '../src/data/products.js';
import { getSeoPage, NOINDEX_PATHS } from '../src/data/seoPages.js';

const outDir = path.resolve('dist');
const shellPath = path.join(outDir, 'index.html');
if (!fs.existsSync(shellPath)) {
  throw new Error(`Built site shell not found at ${shellPath}`);
}

const shell = fs.readFileSync(shellPath, 'utf8');
const baseUrl = 'https://atbrand.store';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `  ${replacement}\n</head>`);
}

function setPageMetadata(html, route, metadata, { noindex = false } = {}) {
  const canonicalPath = route.startsWith('/categories/') ? route.replace('/categories/', '/men/') : route;
  const canonical = canonicalPath === '/' ? `${baseUrl}/` : `${baseUrl}${canonicalPath}`;
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  let output = html;

  output = replaceTag(output, /<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  output = replaceTag(output, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}" />`);
  output = replaceTag(output, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  output = replaceTag(output, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
  output = replaceTag(output, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
  output = replaceTag(output, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  output = replaceTag(output, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  output = replaceTag(output, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`);

  if (noindex) {
    output = replaceTag(output, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow" />');
  }
  return output;
}

function writeRoute(route, metadata, options = {}) {
  const segments = route.split('/').filter(Boolean);
  if (segments.length === 0) {
    fs.writeFileSync(shellPath, setPageMetadata(shell, route, metadata, options));
    return;
  }
  const leaf = `${segments.pop()}.html`;
  const target = path.join(outDir, '__seo', ...segments, leaf);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, setPageMetadata(shell, route, metadata, options));
}

const staticRoutes = [
  '/', '/shop', '/men', '/men/ahmad-cotton', '/men/rashid-cotton',
  '/men/wash-and-wear', '/men/boski', '/men/khaddar', '/men/lattha',
  '/men/karandi', '/new-arrivals', '/stitching', '/about', '/contact',
  '/size-guide', '/shipping-policy', '/return-policy', '/privacy-policy',
  '/terms', '/women', '/perfumes', '/cart', '/checkout', '/track-order',
  '/categories/ahmad-cotton', '/categories/rashid-cotton',
  '/categories/wash-and-wear', '/categories/boski', '/categories/khaddar',
  '/categories/lattha', '/categories/karandi',
];

for (const route of staticRoutes) {
  const noindex = NOINDEX_PATHS.includes(route);
  writeRoute(route, getSeoPage(route), { noindex });
}

for (const product of PRODUCTS) {
  const route = `/product/${product.id}`;
  writeRoute(route, {
    title: `${product.name} Online | ${product.type} Unstitched Suit | AT BRAND`,
    description: `Browse ${product.name} from AT BRAND Sargodha. See current product details, available colours and ordering options for delivery across Pakistan.`,
  });
}

console.log(`Generated route-specific HTML metadata for ${staticRoutes.length + PRODUCTS.length} routes.`);
