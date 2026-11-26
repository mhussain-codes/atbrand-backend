import { PRODUCTS } from './products.js';

const productNameCounts = PRODUCTS.reduce((counts, product) => {
  counts.set(product.name, (counts.get(product.name) || 0) + 1);
  return counts;
}, new Map());

export function getProductSeo(product) {
  if (!product) {
    return {
      displayName: 'Product | AT BRAND',
      title: 'Product | AT BRAND Sargodha',
      description: 'Shop luxury clothing and perfumes from AT BRAND Sargodha with Open Parcel Cash on Delivery across Pakistan.',
      colorSummary: null,
    };
  }

  const isDuplicateName = (productNameCounts.get(product.name) || 0) > 1;
  const colors = Array.isArray(product.colors)
    ? product.colors.map((color) => color?.name).filter(Boolean)
    : [];
  const variantLabel = isDuplicateName
    ? colors.length > 0
      ? colors.slice(0, 2).join(' & ')
      : `item ${product.id}`
    : '';

  const cat = (product.category || '').toLowerCase();
  const isPerfume = cat === 'perfumes' || 
    String(product.type || '').toLowerCase().includes('oud') || 
    String(product.type || '').toLowerCase().includes('perfume') || 
    String(product.name || '').toLowerCase().includes('parfum') || 
    String(product.name || '').toLowerCase().includes('eau de');

  const isWomen = cat === 'women';

  let title = '';
  let description = '';

  if (isPerfume) {
    title = `${product.name} | Original Arabic Fragrance | AT BRAND Pakistan`;
    description = `Buy ${product.name} (${product.type || 'Eau De Parfum'}) at AT BRAND. 100% original long-lasting Arabic scent with Open Parcel Cash on Delivery across Pakistan.`;
  } else if (isWomen) {
    title = `${product.name} | Women's Designer Collection | AT BRAND`;
    description = `Shop ${product.name} from AT BRAND Women's collection. Premium unstitched designer fabric with Cash on Delivery nationwide.`;
  } else {
    title = variantLabel
      ? `${product.name} in ${variantLabel} | AT BRAND`
      : `${product.name} | ${product.type || 'Unstitched'} Suit | AT BRAND Sargodha`;
    description = variantLabel
      ? `Shop this ${product.type || 'unstitched'} suit from AT BRAND Sargodha. This colour selection includes ${variantLabel}${colors.length > 2 ? ' and more' : ''}. View the current price and product details online.`
      : `Browse ${product.name}, a ${product.type || "men's"} unstitched suit from AT BRAND Sargodha. See current product details, available colours and delivery options across Pakistan.`;
  }

  const displayName = variantLabel
    ? `${product.name} — ${variantLabel}`
    : product.name;

  return {
    displayName,
    title,
    description,
    colorSummary: variantLabel && colors.length > 0
      ? `${colors.slice(0, 3).join(', ')}${colors.length > 3 ? ' and more' : ''}`
      : null,
  };
}
