import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLoader from '@/components/BrandLoader';
import ProductCard from '@/components/ProductCard';
import { useBuy } from '@/contexts/BuyContext';
import { Helmet } from 'react-helmet';
import { formatPKR, openWhatsApp, buildInquiryMessage } from '@/lib/whatsapp';
import { ShieldCheck, Truck, RefreshCw, Scissors, ShoppingCart, MessageCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { getProductSeo } from '@/data/productSeo';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { openBuy, addToCart } = useBuy();

  const cleanSlug = String(slug || '').toLowerCase();
  
  // Instant synchronous lookup from PRODUCTS memory for 0ms load time
  const initialProduct = useMemo(() => {
    return PRODUCTS.find(p => 
      String(p.id).toLowerCase() === cleanSlug || 
      (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleanSlug) ||
      (p.slug && p.slug.toLowerCase() === cleanSlug)
    ) || null;
  }, [cleanSlug]);

  const [product, setProduct] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);

  // Sync state and fetch background live updates without blocking UI
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
    setSelectedImage(0);

    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(d => {
        if (d && d.product) {
          setProduct(d.product);
        }
      })
      .catch(() => {});
  }, [slug, initialProduct]);

  // ALL HOOKS DECLARED BEFORE ANY CONDITIONAL RETURNS (Rules of Hooks Compliance)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS
      .filter(p => p.id !== product.id && (p.type === product.type || p.category === product.category))
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Helmet>
          <title>Product Not Found | AT BRAND</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <Header />
        <div className="mx-auto max-w-2xl py-24 text-center px-4">
          <h2 className="text-2xl font-serif font-bold text-primary">Product Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Yeh product filhal dastyab nahi hai ya moved ho gaya hai.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow">
            Dukaan (Shop) Par Wapis Jayein
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/600'];

  const seoProduct = getProductSeo(product);
  // Product IDs are the stable URLs used by the sitemap and product cards.
  const canonicalUrl = `https://atbrand.store/product/${product.id}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://atbrand.store/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': product?.category === 'Men' ? "Men's Collection" : 'Shop',
        'item': product?.category === 'Men' ? 'https://atbrand.store/men' : 'https://atbrand.store/shop'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product?.name,
        'item': canonicalUrl
      }
    ]
  };

  // Dynamic JSON-LD Structured Data for Technical SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': seoProduct.displayName,
    'image': images,
    'description': product.fabric || `${product.name} unstitched men's suit by AT BRAND Sargodha.`,
    'sku': product.sku || `AT-${product.id}`,
    'brand': {
      '@type': 'Brand',
      'name': 'AT BRAND'
    },
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': 'PKR',
      'price': product.price,
      'availability': product.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'seller': {
        '@type': 'Organization',
        'name': 'AT BRAND Sargodha'
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{seoProduct.title}</title>
        <meta name="description" content={seoProduct.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoProduct.title} />
        <meta property="og:description" content={seoProduct.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={images[0]} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={product.category === 'Men' ? '/men' : '/shop'} className="hover:text-primary">
            {product.category === 'Men' ? "Men's Collection" : "Shop"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse gap-4 sm:flex-row">
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-y-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${selectedImage === idx ? 'border-primary ring-2 ring-accent' : 'border-border'}`}
                  >
                    <img src={img} alt={`${product.name} product view ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
              {product.type && (
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow">
                  {product.type}
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Details and Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Men's Premium Suit</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-4xl">
              {product.name}
            </h1>
            {seoProduct.colorSummary && (
              <p className="mt-2 text-sm text-muted-foreground">
                This colour selection includes {seoProduct.colorSummary}.
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-2xl font-bold text-primary sm:text-3xl">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </div>

            {product.fabric && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <span className="font-bold text-primary block mb-1">Fabric Specification:</span>
                {product.fabric}
              </div>
            )}

            {/* Custom Stitching Decision Card */}
            <div className="mt-6 rounded-2xl border-2 border-primary/25 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary p-2.5 text-primary-foreground shrink-0 mt-0.5">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-foreground mb-1">
                    Bespoke Tailoring
                  </span>
                  <h3 className="font-serif text-base font-bold text-primary">
                    Do you want custom stitching with this suit?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Kya aap is suit ki master tailor se customized silai karwana chahte hain? Custom stitching fee <b>PKR 1,500</b> add hogi aur suit apke exact naap ke mutabiq silai hokar deliver hoga.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      to={`/stitching?suitId=${encodeURIComponent(product.id)}&suitName=${encodeURIComponent(product.name)}&suitPrice=${product.price}&suitImage=${encodeURIComponent(images[selectedImage] || images[0] || '')}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow hover:bg-primary/90 transition active:scale-95"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                      Yes, Add Stitching (+PKR 1,500)
                    </Link>
                    <button
                      onClick={() => openBuy(product)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 transition"
                    >
                      No, Unstitched Fabric Only
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => openBuy(product)}
                className="w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95"
              >
                Buy Now (Cash on Delivery)
              </button>

              <button
                onClick={() => addToCart(product)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary py-3.5 text-xs font-bold uppercase tracking-widest text-primary transition hover:bg-primary/5 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button
                onClick={() => openWhatsApp(buildInquiryMessage(product))}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 py-3 text-xs font-bold tracking-wider text-emerald-800 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Inquire on WhatsApp
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center text-[11px] text-muted-foreground">
              <div className="flex flex-col items-center">
                <Truck className="h-5 w-5 text-accent mb-1" />
                <span>Nationwide Shipping</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-5 w-5 text-accent mb-1" />
                <span>Product Details Listed</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw className="h-5 w-5 text-accent mb-1" />
                <Link to="/return-policy" className="hover:underline">7-Day Returns for Eligible Issues</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Premium Fabrics - Continuous Internal Linking for High SEO */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Complete Your Collection</p>
                <h2 className="font-serif text-2xl font-bold text-[#1C3A2B]">Related Premium Fabrics</h2>
              </div>
              <Link
                to={product.category === 'Men' ? '/men' : '/shop'}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
              >
                <span>Explore More</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
