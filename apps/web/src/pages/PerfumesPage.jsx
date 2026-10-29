import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Sparkles, BellRing } from 'lucide-react';
import { openWhatsApp } from '@/lib/whatsapp';

export default function PerfumesPage() {
  const [products, setProducts] = useState([]);
  const [isComingSoon, setIsComingSoon] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=Perfumes')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          const perfumesOnly = data.products.filter(p => (p.category || '').toLowerCase() === 'perfumes');
          if (perfumesOnly.length > 0) {
            setProducts(perfumesOnly);
            setIsComingSoon(false);
          } else {
            setProducts([]);
            setIsComingSoon(true);
          }
        }
      })
      .catch(() => {
        setProducts([]);
        setIsComingSoon(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <BrandLoader message="Loading Fragrance Lounge..." />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Luxury Fragrances & Attars | AT BRAND Perfumes</title>
        <meta
          name="description"
          content="Experience artisanal Oriental and French perfumery by AT BRAND. Long-lasting luxury scents and pure concentrates."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Artisanal Scent Atelier</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            AT BRAND PERFUMES
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Long-lasting pure oils, opulent Royal Oudh, Amber, and modern fresh French fragrances designed for enduring distinction.
          </p>
        </div>

        {isComingSoon || products.length === 0 ? (
          <div className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-background p-10 text-center shadow-lg sm:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>

            <h2 className="mt-8 font-serif text-3xl font-bold tracking-wider text-primary">
              COMING SOON
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              We are carefully sourcing distilled natural accords and luxury glass flacons. The signature perfume launch will be unveiled shortly.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => openWhatsApp("Assalam-o-Alaikum! Please notify me when AT BRAND Perfumes are officially launched.")}
                className="inline-flex items-center gap-2 rounded-full bg-[#1C3A2B] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow transition hover:opacity-90 active:scale-95"
              >
                <BellRing className="h-4 w-4" />
                Notify Me on WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
