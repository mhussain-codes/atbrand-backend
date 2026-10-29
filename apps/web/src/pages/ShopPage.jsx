import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { PRODUCTS, TYPES, PRICE_BANDS, SEASONS } from '@/data/products';
import { createClient } from '@supabase/supabase-js';

// Supabase Connection
const supabase = createClient(
  'https://mgolzolmhfqsjziuuauq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nb2x6b2xtaGZxc2p6aXV1YXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDc3NjUsImV4cCI6MjEwNzgyMzc2NX0.vjYe2I5X6cmVuLy7R5q4ibIi_MDi-xurympVa8ikhMY'
);

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary'
        }`}
    >
      {children}
    </button>
  );
}

// Smart Color Search Dictionary
const colorSynonyms = {
  'blue': ['blue', 'sky blue', 'medium blue', 'ice blue', 'arctic blue', 'slate blue', 'powder blue', 'navy', 'peacock', 'zink', 'aqua'],
  'white': ['white', 'pure white', 'off-white', 'off white', 'cream', 'ivory', 'milk white', 'beige'],
  'brown': ['brown', 'camel', 'khaki', 'caramel', 'peanut', 'chocolate', 'taupe', 'latte', 'rust'],
  'green': ['green', 'olive', 'sage', 'mint', 'pistachio'],
  'grey': ['grey', 'gray', 'charcoal', 'slate', 'steel'],
  'purple': ['purple', 'lilac', 'lavender', 'plum', 'mauve', 'violet'],
  'red': ['red', 'burgundy', 'maroon', 'rose', 'dusty rose'],
  'yellow': ['yellow', 'mustard'],
  'black': ['black', 'soft black']
};

export default function ShopPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State jismein purane + naye dono products honge
  const [allProducts, setAllProducts] = useState(PRODUCTS);

  useEffect(() => {
    async function fetchSupabaseProducts() {
      const { data, error } = await supabase
        .from('storefront_products')
        .select('*');

      if (data && !error) {
        // Naye products ko aapke purane design format mein set karna
        const formattedSupabaseProducts = data.map(product => {
          const imageUrls = Array.isArray(product.image_urls)
            ? product.image_urls.filter(url => typeof url === 'string' && url.trim())
            : [];

          if (product.image_url && !imageUrls.includes(product.image_url)) {
            imageUrls.unshift(product.image_url);
          }

          return {
            id: product.id,
            name: product.name,
            type: product.category || 'Unstitched',
            season: '4 Season',
            price: Number(product.price),
            originalPrice: null,
            fabric: product.description || '',
            images: imageUrls,
            image_url: imageUrls[0] || null,
            image_urls: imageUrls,
            colors: [],
            isNew: false,
            featured: false,
            in_stock: product.in_stock !== false,
          };
        });

        // Keep the existing static catalog and merge live products without duplicate IDs.
        const mergedProducts = new Map(PRODUCTS.map(product => [String(product.id), product]));
        formattedSupabaseProducts.forEach(product => mergedProducts.set(String(product.id), product));
        setAllProducts(Array.from(mergedProducts.values()));
      }
    }

    fetchSupabaseProducts();
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      // Fabric Filter
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;

      // Season Filter
      if (seasonFilter !== 'all' && p.season !== seasonFilter) return false;

      // Price Filter
      if (bandFilter !== 'all') {
        const band = PRICE_BANDS.find((b) => b.id === bandFilter);
        if (band && (p.price < band.min || p.price > band.max)) return false;
      }

      // Smart Color Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const searchTerms = colorSynonyms[query] || [query];

        const nameStr = (p.name || '').toLowerCase();
        const colorsStr = p.colors ? p.colors.map(c => (c.name || '').toLowerCase()).join(" ") : "";

        const matchesSearch = searchTerms.some(term => nameStr.includes(term) || colorsStr.includes(term));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allProducts, typeFilter, bandFilter, seasonFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Shop Mens Premium Unstitched Suits | AT Brand Sargodha</title>
        <meta
          name="description"
          content="Browse the full AT Brand Sargodha collection of mens unstitched shalwar kameez. Filter by fabric, season, and price to find your perfect premium unstitched suit."
        />
      </Helmet>

      <Header />
      <main className="pt-16">
        <section className="border-b border-border/60 bg-secondary/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-10 bg-accent" />
                AT Brand Sargodha Collection
              </p>
              <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
                Mens Premium Unstitched Suits
              </h1>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Explore our exclusive collection of mens unstitched shalwar kameez. Filter by fabric, season, or price to find your perfect suit. Tap Buy Now to order on WhatsApp with cash on delivery.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="space-y-4">

              {/* --- SEARCH BAR --- */}
              <div className="flex w-full max-w-md items-center mb-6">
                <input
                  type="text"
                  placeholder="Search colors (e.g. blue, brown, red)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              {/* Fabric Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Fabric
                </span>
                <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All</Chip>
                {TYPES.map((t) => (
                  <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
                ))}
              </div>

              {/* Season Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Season
                </span>
                <Chip active={seasonFilter === 'all'} onClick={() => setSeasonFilter('all')}>All</Chip>
                {SEASONS.map((s) => (
                  <Chip key={s} active={seasonFilter === s} onClick={() => setSeasonFilter(s)}>{s}</Chip>
                ))}
              </div>

              {/* Price Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Price
                </span>
                <Chip active={bandFilter === 'all'} onClick={() => setBandFilter('all')}>All Prices</Chip>
                {PRICE_BANDS.map((b) => (
                  <Chip key={b.id} active={bandFilter === b.id} onClick={() => setBandFilter(b.id)}>
                    PKR {b.label}
                  </Chip>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'piece' : 'pieces'}
            </p>

            {filtered.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                <p className="font-display text-2xl text-foreground">No pieces in this combination</p>
                <p className="mt-2 text-sm text-muted-foreground">Try a different fabric, season, price range or color.</p>
                <button
                  onClick={() => { setTypeFilter('all'); setSeasonFilter('all'); setBandFilter('all'); setSearchQuery(''); }}
                  className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
