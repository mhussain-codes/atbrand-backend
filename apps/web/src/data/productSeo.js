import { PRODUCTS } from './products.js';

const productNameCounts = PRODUCTS.reduce((counts, product) => {
  counts.set(product.name, (counts.get(product.name) || 0) + 1);
  return counts;
}, new Map());

export function getProductSeo(product) {
  const isDuplicateName = (productNameCounts.get(product.name) || 0) > 1;
  const colors = Array.isArray(product.colors)
    ? product.colors.map((color) => color?.name).filter(Boolean)
    : [];
  const variantLabel = isDuplicateName
    ? colors.length > 0
      ? colors.slice(0, 2).join(' & ')
      : `item ${product.id}`
    : '';
  const displayName = variantLabel
    ? `${product.name} — ${variantLabel} colour selection`
    : product.name;
  const title = variantLabel
    ? `${product.name} in ${variantLabel} | AT BRAND`
    : `${product.name} | ${product.type} Unstitched Suit | AT BRAND Sargodha`;
  const description = variantLabel
    ? `Shop this ${product.type} unstitched suit from AT BRAND Sargodha. This colour selection includes ${variantLabel}${colors.length > 2 ? ' and more' : ''}. View the current price and product details online.`
    : `Browse ${product.name}, a ${product.type} men's unstitched suit from AT BRAND Sargodha. See current product details, available colours and delivery options across Pakistan.`;

  return {
    displayName,
    title,
    description,
    colorSummary: variantLabel && colors.length > 0
      ? `${colors.slice(0, 3).join(', ')}${colors.length > 3 ? ' and more' : ''}`
      : null,
  };
}
