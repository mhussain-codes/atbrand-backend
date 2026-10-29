import React, { useState, useEffect } from 'react';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import { TYPES, PRICE_BANDS, SEASONS } from '@/data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition active:scale-[0.98] ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Decent 8 items per page on Homepage

  // Search Logic Filter
  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase().trim();
    const searchTerms = colorSynonyms[query] || [query];

    const nameStr = p.name.toLowerCase();
    const colorsStr = p.colors ? p.colors.map(c => c.name.toLowerCase()).join(" ") : "";

    return searchTerms.some(term => nameStr.includes(term) || colorsStr.includes(term));
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, bandFilter, seasonFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate pagination page numbers array with ellipses
  const getPaginationGroup = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <section id="collection" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" />
              Curated Catalog
              <span className="h-px w-8 bg-accent" />
            </p>
            <h2 className="mt-3 font-display text-3xl text-foreground sm:text-5xl font-bold">
              The Signature Collection
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore premium handpicked unstitched fabrics. Select your preferred weave, season, and color.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            {/* Search Bar */}
            <div className="flex w-full max-w-md items-center mx-auto sm:mx-0">
              <input
                type="text"
                placeholder="Search shades & colors (e.g. blue, camel, off white)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-input bg-background px-4 py-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {/* Fabric Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <span className="mr-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fabric:
              </span>
              <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                All Fabrics
              </Chip>
              {TYPES.map((t) => (
                <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                  {t}
                </Chip>
              ))}
            </div>

            {/* Season Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <span className="mr-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Season:
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
          </div>
        </Reveal>

        {/* Status Counter */}
        <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
          <p>
            Showing <span className="font-bold text-foreground">{currentProducts.length}</span> of{' '}
            <span className="font-bold text-foreground">{filteredProducts.length}</span> total suits
          </p>
          {totalPages > 1 && (
            <p>
              Page <span className="font-bold text-foreground">{currentPage}</span> of{' '}
              <span className="font-bold text-foreground">{totalPages}</span>
            </p>
          )}
        </div>

        {/* Product Grid - Exactly 8 per page */}
        {currentProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="font-display text-2xl text-foreground">No suits match this combination</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try selecting a different fabric, season, or reset your filters.
            </p>
            <button
              onClick={() => {
                setTypeFilter('all');
                setBandFilter('all');
                setSeasonFilter('all');
                setSearchQuery('');
              }}
              className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:opacity-95"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Bar (1 ... 2 ... 3 like standard store) */}
        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {getPaginationGroup().map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-muted-foreground">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`h-10 w-10 rounded-xl text-xs font-bold transition ${
                    currentPage === item
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'border border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
