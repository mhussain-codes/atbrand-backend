export const SEO_PAGES = {
  '/': {
    title: "AT BRAND Sargodha | Men's Unstitched Suits Online",
    description: "Shop men's unstitched shalwar kameez suits at AT BRAND Sargodha. Browse Ahmad Cotton, Rashid Cotton, Wash & Wear, Boski and Khaddar, with custom stitching and delivery across Pakistan.",
  },
  '/shop': {
    title: "Men's Unstitched Suits Online in Pakistan | AT BRAND Shop",
    description: "Browse AT BRAND's men's unstitched suit collection online. Compare available fabrics, colours and current prices, then order from Sargodha with delivery options across Pakistan.",
  },
  '/men': {
    title: "Men's Unstitched Shalwar Kameez Suits | AT BRAND Sargodha",
    description: "Explore men's unstitched shalwar kameez fabrics at AT BRAND, Sargodha: Ahmad Cotton, Rashid Cotton, Wash & Wear, Boski, Khaddar and more. Check available colours and prices online.",
  },
  '/men/ahmad-cotton': {
    title: "Ahmad Cotton Unstitched Suits for Men | AT BRAND",
    description: "Browse available Ahmad Cotton men's unstitched shalwar kameez suits at AT BRAND Sargodha. See current colours and product details, with delivery options across Pakistan.",
  },
  '/men/rashid-cotton': {
    title: "Rashid Cotton Unstitched Suits for Men | AT BRAND",
    description: "Shop the current Rashid Cotton men's unstitched suit collection at AT BRAND Sargodha. Compare available colours, seasonal styles and product details online.",
  },
  '/men/wash-and-wear': {
    title: "Men's Wash & Wear Unstitched Suits | AT BRAND Pakistan",
    description: "Explore men's Wash & Wear unstitched shalwar kameez suits at AT BRAND. Check current colours, product details and delivery options from Sargodha across Pakistan.",
  },
  '/men/boski': {
    title: "Men's Boski Unstitched Suits Online | AT BRAND Sargodha",
    description: "Browse available Boski men's unstitched suits at AT BRAND Sargodha. View current colours and product information before ordering online in Pakistan.",
  },
  '/men/khaddar': {
    title: "Men's Khaddar Unstitched Suits | AT BRAND Pakistan",
    description: "Shop the available men's Khaddar unstitched suit collection at AT BRAND Sargodha. See current colours, seasonal details and delivery options across Pakistan.",
  },
  '/men/lattha': {
    title: "Men's Lattha Unstitched Suits | AT BRAND Sargodha",
    description: "Browse men's Lattha unstitched shalwar kameez suits at AT BRAND. Check current product availability, colours and ordering details from Sargodha, Pakistan.",
  },
  '/men/karandi': {
    title: "Men's Karandi Unstitched Suits | AT BRAND Pakistan",
    description: "Explore the current men's Karandi unstitched suit selection at AT BRAND Sargodha. View product details and available colours with delivery options across Pakistan.",
  },
  '/new-arrivals': {
    title: "New Men's Unstitched Suit Arrivals | AT BRAND Sargodha",
    description: "See the latest additions to AT BRAND's men's unstitched collection, including current fabrics and colours. Browse product details and order online in Pakistan.",
  },
  '/stitching': {
    title: "Custom Shalwar Kameez Stitching in Pakistan | AT BRAND",
    description: "Explore AT BRAND's custom stitching options for men's shalwar kameez, with an interactive 3D design preview and order details from Sargodha, Pakistan.",
  },
  '/about': {
    title: "About AT BRAND | Men's Clothing Store in Sargodha",
    description: "Learn about AT BRAND, a Sargodha-based store for men's unstitched fabrics and custom stitching, with online ordering and delivery options across Pakistan.",
  },
  '/contact': {
    title: "Contact AT BRAND Sargodha | Orders & Customer Support",
    description: "Contact AT BRAND in Sargodha about men's unstitched suits, product details, stitching or an order. Reach the store by WhatsApp, email or in person.",
  },
  '/size-guide': {
    title: "Men's Shalwar Kameez Size & Measurement Guide | AT BRAND",
    description: "Use AT BRAND's men's shalwar kameez size and measurement guide before choosing custom stitching. Contact the Sargodha team if you need help with your order.",
  },
  '/shipping-policy': {
    title: "Shipping & Delivery Policy | AT BRAND Pakistan",
    description: "Read AT BRAND's delivery information for online orders from Sargodha to destinations across Pakistan.",
  },
  '/return-policy': {
    title: "Returns & Exchanges Policy | AT BRAND Pakistan",
    description: "Review AT BRAND's current return and exchange terms before placing an online order.",
  },
  '/women': {
    title: "Women's Collection Coming Soon | AT BRAND Sargodha",
    description: "AT BRAND's women's collection is not available yet. Browse the current men's unstitched suit collection while new products are being prepared.",
  },
  '/perfumes': {
    title: "AT BRAND Perfumes | Coming Soon",
    description: "AT BRAND perfumes are not available yet. Check back for launch information or browse the current men's unstitched suit collection.",
  },
  '/cart': {
    title: "Shopping Cart | AT BRAND",
    description: "Review the products in your AT BRAND shopping cart.",
  },
  '/checkout': {
    title: "Checkout | AT BRAND",
    description: "Complete your AT BRAND order.",
  },
  '/track-order': {
    title: "Track Your AT BRAND Order",
    description: "Check the current delivery status of an AT BRAND order.",
  },
  '/privacy-policy': {
    title: "Privacy Policy | AT BRAND",
    description: "Read how AT BRAND handles information submitted through the online store.",
  },
  '/terms': {
    title: "Terms & Conditions | AT BRAND",
    description: "Review the terms that apply when browsing or placing an order with AT BRAND.",
  },
};

export function getSeoPage(pathname) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (path.startsWith('/categories/')) return SEO_PAGES[path.replace('/categories/', '/men/')] || SEO_PAGES['/men'];
  return SEO_PAGES[path] || {
    title: "Men's Unstitched Suits | AT BRAND Sargodha",
    description: "Browse men's unstitched suits and shalwar kameez fabrics at AT BRAND Sargodha. View current product details and delivery options across Pakistan.",
  };
}

export const NOINDEX_PATHS = ['/women', '/perfumes', '/cart', '/checkout', '/track-order'];
