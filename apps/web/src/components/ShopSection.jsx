import React, { useState } from 'react';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { TYPES, PRICE_BANDS, SEASONS } from '@/data/products';

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

export default function ShopSection({
  products,
  typeFilter,
  setTypeFilter,
  bandFilter,
  setBandFilter,
  seasonFilter,
  setSeasonFilter,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Search Logic Filter
  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase().trim();
    const searchTerms = colorSynonyms[query] || [query];

    const nameStr = p.name.toLowerCase();
    const colorsStr = p.colors ? p.colors.map(c => c.name.toLowerCase()).join(" ") : "";

    return searchTerms.some(term => nameStr.includes(term) || colorsStr.includes(term));
  });

  return (
    <section id="collection" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-10 bg-accent" />
            The Collection
          </p>
          <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
            Four fabrics. One standard.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Filter by fabric, season or budget — every piece is cut by master tailors and delivered to your
            door with cash on delivery.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 space-y-4">

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

            {/* --- NAYA SEASON FILTER SECTION --- */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Season
              </span>
              <Chip active={seasonFilter === 'all'} onClick={() => setSeasonFilter('all')}>
                All Seasons
              </Chip>
              {SEASONS.map((s) => (
                <Chip key={s} active={seasonFilter === s} onClick={() => setSeasonFilter(s)}>
                  {s}
                </Chip>
              ))}
            </div>

            {/* --- FABRIC FILTER --- */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Fabric
              </span>
              <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                All
              </Chip>
              {TYPES.map((t) => (
                <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                  {t}
                </Chip>
              ))}
            </div>

            {/* --- PRICE FILTER --- */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Price
              </span>
              <Chip active={bandFilter === 'all'} onClick={() => setBandFilter('all')}>
                All Prices
              </Chip>
              {PRICE_BANDS.map((b) => (
                <Chip key={b.id} active={bandFilter === b.id} onClick={() => setBandFilter(b.id)}>
                  PKR {b.label}
                </Chip>
              ))}
            </div>

          </div>
        </Reveal>

        <p className="mt-8 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span>{' '}
          {filteredProducts.length === 1 ? 'piece' : 'pieces'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="font-display text-2xl text-foreground">No pieces in this combination</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different fabric, season, price range or color.
            </p>
            <button
              onClick={() => {
                setTypeFilter('all');
                setBandFilter('all');
                setSeasonFilter('all');
                setSearchQuery(''); // Reset search also
              }}
              className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}