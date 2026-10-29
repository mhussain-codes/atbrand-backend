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
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { PRODUCTS, PRICE_BANDS } from '@/data/products';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase Connection
const supabase = createClient(
  'https://mgolzolmhfqsjziuuauq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nb2x6b2xtaGZxc2p6aXV1YXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDc3NjUsImV4cCI6MjEwNzgyMzc2NX0.vjYe2I5X6cmVuLy7R5q4ibIi_MDi-xurympVa8ikhMY'
);

const HERO_IMAGE = 'https://images.hostinger.com/b3da7f12-753f-4d7f-b0c2-c61996be718d.png';

export default function HomePage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all'); 
  
  // 2. State jismein purane + naye dono products honge
  const [allProducts, setAllProducts] = useState(PRODUCTS);

  useEffect(() => {
    async function fetchSupabaseProducts() {
      const { data, error } = await supabase
        .from('storefront_products')
        .select('*');

      if (data && !error) {
        // Naye products ko aapke purane format mein dhalna
        const formattedSupabaseProducts = data.map(p => ({
          id: p.id,
          name: p.name,
          type: p.category || 'Unstitched',
          season: '4 Season', 
          price: Number(p.price),
          originalPrice: null,
          fabric: p.description || '',
          images: p.image_url ? [p.image_url] : ['https://via.placeholder.com/400'],
          colors: [],
          in_stock: p.in_stock !== false,
          isNew: true, // Naye add hone wale products automatically New Arrivals mein aayenge
          featured: true // Inko Featured section mein bhi show karega
        }));

        // Purane aur naye products ko merge karna
        setAllProducts([...PRODUCTS, ...formattedSupabaseProducts]);
      }
    }

    fetchSupabaseProducts();
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