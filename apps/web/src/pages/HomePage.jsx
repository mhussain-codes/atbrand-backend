import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ShopSection from '@/components/ShopSection';
import PriceBands from '@/components/PriceBands';
import HowToOrder from '@/components/HowToOrder';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { PRODUCTS, PRICE_BANDS } from '@/data/products';

const HERO_IMAGE = 'https://images.hostinger.com/b3da7f12-753f-4d7f-b0c2-c61996be718d.png';

export default function HomePage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all'); 
  const [allProducts, setAllProducts] = useState(PRODUCTS);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        if (d.products && d.products.length > 0) {
          setAllProducts(d.products);
        }
      })
      .catch(() => {});
  }, []);

  // 3. PRODUCTS ki jagah allProducts use kiya gaya hai
  const filtered = useMemo(
    () =>
      allProducts.filter((p) => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (seasonFilter !== 'all' && p.season !== seasonFilter) return false; 
        
        if (bandFilter !== 'all') {
          const band = PRICE_BANDS.find((b) => b.id === bandFilter);
          if (band && (p.price < band.min || p.price > band.max)) return false;
        }
        return true;
      }),
    [allProducts, typeFilter, bandFilter, seasonFilter] 
  );

  const newArrivals = useMemo(() => allProducts.filter((p) => p.isNew), [allProducts]);
  const featured = useMemo(() => allProducts.filter((p) => p.featured).slice(0, 4), [allProducts]);

  const handleBandSelect = (id) => {
    setTypeFilter('all');
    setSeasonFilter('all'); 
    setBandFilter(id);
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO Updated Meta Tags */}
      <Helmet>
        <title>AT Brand Sargodha | Mens Premium Unstitched Suits</title>
        <meta
          name="description"
          content="Shop mens premium unstitched suits and shalwar kameez at AT Brand Sargodha. Buy the best Wash & Wear, Ahmad Cotton, Boski, and Khaddar online in Pakistan."
        />
      </Helmet>

      <Header />
      <main>
        <Hero image={HERO_IMAGE} />
        <Marquee />

        {/* Men's Master Fabrics Grid - Instant Sub-Page Navigation & High SEO */}
        <section className="bg-slate-50/70 py-14 sm:py-18 border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#C5A880]">
                  Authentic Unstitched Shalwar Kameez
                </p>
                <h2 className="mt-2 font-serif text-3xl font-extrabold text-[#1C3A2B] sm:text-4xl">
                  Shop Men's Master Fabrics
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  Select your fabric weave directly — pure combed cottons, executive pure boski, soft wash &amp; wear, and authentic winter khaddar.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { name: 'Rashid Cotton', slug: 'rashid-cotton', tag: 'Crisp Cotton', desc: 'Combed yarn daily luxury' },
                { name: 'Ahmad Cotton', slug: 'ahmad-cotton', tag: 'Royal Finish', desc: 'Structured drape & fall' },
                { name: 'Wash & Wear', slug: 'wash-and-wear', tag: 'Wrinkle-Free', desc: 'Low maintenance grace' },
                { name: 'Pure Boski', slug: 'boski', tag: 'Executive Silk', desc: 'Ceremonial & formal wear' },
                { name: 'Winter Khaddar', slug: 'khaddar', tag: 'Kamalia Weave', desc: 'Warm texture comfort' },
                { name: 'Egyptian Lattha', slug: 'lattha', tag: 'Pristine White', desc: 'Crisp ceremonial classic' },
              ].map((cat, idx) => (
                <Reveal key={cat.slug} delay={idx * 0.04}>
                  <Link
                    to={`/men/${cat.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:border-[#1C3A2B] hover:shadow-md hover:-translate-y-0.5 duration-200"
                  >
                    <div>
                      <span className="inline-block rounded-full bg-[#1C3A2B]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1C3A2B] mb-2.5">
                        {cat.tag}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-slate-900 group-hover:text-[#1C3A2B]">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-[#1C3A2B] group-hover:gap-1.5 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section id="featured" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    <span className="h-px w-10 bg-accent" />
                    AT Brand Sargodha
                  </p>
                  {/* SEO Updated Heading */}
                  <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
                    Mens Premium Unstitched Suits
                  </h2>
                </div>
                <Link
                  to="/shop"
                  className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 sm:inline-flex"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* New arrivals preview */}
        <section id="new-arrivals" className="scroll-mt-20 bg-secondary/50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    <span className="h-px w-10 bg-accent" />
                    New Arrivals
                  </p>
                  {/* SEO Updated Heading */}
                  <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
                    Latest Unstitched Shalwar Kameez
                  </h2>
                </div>
                <Link
                  to="/new-arrivals"
                  className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 sm:inline-flex"
                >
                  See all new <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className="mt-10 text-center sm:hidden">
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary"
                >
                  See all new arrivals <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <ShopSection
          products={filtered}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          bandFilter={bandFilter}
          setBandFilter={setBandFilter}
          seasonFilter={seasonFilter}      
          setSeasonFilter={setSeasonFilter} 
        />
        <PriceBands onSelect={handleBandSelect} />
        <TestimonialsSection />
        <HowToOrder />

        {/* About Us Section */}
        <section className="bg-secondary/20 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
                About AT Brand Sargodha
              </h2>
              {/* SEO Updated Paragraph */}
              <p className="text-base leading-relaxed text-foreground/80 sm:text-lg sm:leading-8">
                AT Brand Sargodha is your premier destination for mens premium unstitched suits. We specialize in high-quality fabrics, including Ahmad Cotton, Wash &amp; Wear, Boski, and Khaddar. Dedicated to elegance and quality, our mission is to provide meticulously selected mens unstitched shalwar kameez designed for the modern gentleman. Proudly based in Sargodha, we offer nationwide cash-on-delivery to bring the finest fabrics straight to your doorstep.
              </p>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}