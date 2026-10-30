import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLoader from '@/components/BrandLoader';
import { useBuy } from '@/contexts/BuyContext';
import { Helmet } from 'react-helmet';
import { formatPKR, openWhatsApp, buildInquiryMessage } from '@/lib/whatsapp';
import { ShieldCheck, Truck, RefreshCw, Scissors, ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { openBuy, addToCart } = useBuy();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // Try matching by slug/id in backend, fallback to PRODUCTS
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.product) {
          setProduct(d.product);
        } else {
          findFallback();
        }
      })
      .catch(() => findFallback())
      .finally(() => setLoading(false));

    function findFallback() {
      const match = PRODUCTS.find(p => p.id === slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
      if (match) setProduct(match);
    }
  }, [slug]);

  if (loading) return <BrandLoader message="Loading Product Details..." />;

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-2xl py-24 text-center">
          <h2 className="text-2xl font-bold text-primary">Product Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">The requested product could not be located or has moved.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground">
            Return to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/600'];

  // Dynamic JSON-LD Structured Data for Technical SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': images,
    'description': product.fabric || `${product.name} unstitched men's suit by AT BRAND Sargodha.`,
    'sku': product.sku || `AT-${product.id}`,
    'brand': {
      '@type': 'Brand',
      'name': 'AT BRAND'
    },
    'offers': {
      '@type': 'Offer',
      'url': window.location.href,
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
        <title>{`${product.name} | AT BRAND Sargodha`}</title>
        <meta name="description" content={`Buy ${product.name} (${product.type}). Premium unstitched suit fabric in Pakistan. Cash on delivery nationwide.`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
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
                    <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
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
                <span>100% Guaranteed Fabric</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw className="h-5 w-5 text-accent mb-1" />
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
