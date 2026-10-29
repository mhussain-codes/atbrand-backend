import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WomensPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=Women')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          // Filter strictly for women products
          const womenOnly = data.products.filter(p => (p.category || '').toLowerCase() === 'women');
          setProducts(womenOnly);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <BrandLoader message="Loading Women's Collection..." />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Women's Collection | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Discover AT BRAND's upcoming Women's Collection. Premium unstitched lawn, luxury pret, and traditional elegance."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Exquisite Craftsmanship</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Women's Premium Line
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Curated pret and unstitched silhouettes designed with breathable fabrics, intricate motifs, and timeless grace.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center sm:p-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold text-primary">New Season Launching Soon</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Our master artisans are currently finishing the initial Women's seasonal release. Stay tuned or explore our acclaimed Men's unstitched suits.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/men"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-95"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Men's Collection
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
