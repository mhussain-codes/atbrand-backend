import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { TYPES, PRICE_BANDS, SEASONS, PRODUCTS } from '@/data/products';
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { openWhatsApp } from '@/lib/whatsapp';

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98] ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-slate-300 bg-white text-slate-700 hover:border-primary/50 hover:text-primary'
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

export default function ShopPage() {
  // Main Department Switcher: 'all', 'men', 'women', 'perfumes'
  const [sectionFilter, setSectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState(PRODUCTS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sectionFilter, typeFilter, bandFilter, seasonFilter, searchQuery]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      // Department filter
      if (sectionFilter !== 'all') {
        const prodCategory = (p.category || 'Men').toLowerCase();
        if (prodCategory !== sectionFilter.toLowerCase()) return false;
      }

      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (seasonFilter !== 'all' && p.season !== seasonFilter) return false;

      if (bandFilter !== 'all') {
        const band = PRICE_BANDS.find((b) => b.id === bandFilter);
        if (band && (p.price < band.min || p.price > band.max)) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchTerms = colorSynonyms[query] || [query];
        const nameStr = (p.name || '').toLowerCase();
        const colorsStr = p.colors ? p.colors.map(c => (c.name || '').toLowerCase()).join(" ") : "";
        const matchesSearch = searchTerms.some(term => nameStr.includes(term) || colorsStr.includes(term));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allProducts, sectionFilter, typeFilter, bandFilter, seasonFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Helmet>
        <title>Men's Unstitched Suits Online in Pakistan | AT BRAND Shop</title>
        <meta
          name="description"
          content="Browse AT BRAND's men's unstitched suit collection online. Compare available fabrics, colours and current prices, then order from Sargodha with delivery options across Pakistan."
        />
      </Helmet>

      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">Complete Brand Boutique</p>
            <h1 className="mt-2 font-serif text-3xl font-extrabold text-[#1C3A2B] sm:text-5xl">
              Shop All Categories
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-slate-600 sm:text-base">
              Explore Men's premium unstitched suits, upcoming Women's pret, and artisanal signature Perfumes.
            </p>
          </div>

          {/* Department Selection Tabs: Men, Women, Perfumes */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl border border-slate-300 bg-white p-1.5 shadow-sm">
              {[
                { id: 'all', label: 'All Collections' },
                { id: 'men', label: "Men's Clothing" },
                { id: 'women', label: "Women's (Coming Soon)" },
                { id: 'perfumes', label: 'Perfumes (Coming Soon)' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setSectionFilter(sec.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
                    sectionFilter === sec.id
                      ? 'bg-[#1C3A2B] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* If Women or Perfumes selected and empty, show clean coming soon box */}
          {(sectionFilter === 'women' || sectionFilter === 'perfumes') && filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto my-12">
              <Sparkles className="mx-auto h-12 w-12 text-[#C5A880] mb-4 animate-pulse" />
              <h2 className="font-serif text-2xl font-bold text-[#1C3A2B] uppercase tracking-wide">
                {sectionFilter === 'women' ? "Women's Line Coming Soon" : "Luxury Fragrances Coming Soon"}
              </h2>
              <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                {sectionFilter === 'women'
                  ? "Our master artisans are finalizing the exquisite Women's summer lawn and luxury pret line. Products will appear here upon launch."
                  : "We are carefully distilling signature Oudh and fresh French accords. The Perfumes collection will be live shortly."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openWhatsApp(`Assalam-o-Alaikum! Please notify me when AT BRAND ${sectionFilter === 'women' ? "Women's collection" : "Perfumes"} is live.`)}
                  className="rounded-full bg-[#25D366] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#20ba59]"
                >
                  Notify Me on WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm mb-8 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search shades & colors (e.g. blue, brown, red)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>

                {/* Fabric Type */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="mr-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Fabric:</span>
                  <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Fabrics</Chip>
                  {TYPES.map((t) => (
                    <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
                  ))}
                </div>

                {/* Season */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="mr-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Season:</span>
                  <Chip active={seasonFilter === 'all'} onClick={() => setSeasonFilter('all')}>All Seasons</Chip>
                  {SEASONS.map((s) => (
                    <Chip key={s} active={seasonFilter === s} onClick={() => setSeasonFilter(s)}>{s}</Chip>
                  ))}
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="mr-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Price:</span>
                  <Chip active={bandFilter === 'all'} onClick={() => setBandFilter('all')}>All Prices</Chip>
                  {PRICE_BANDS.map((b) => (
                    <Chip key={b.id} active={bandFilter === b.id} onClick={() => setBandFilter(b.id)}>
                      PKR {b.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-200 pb-2">
                <span>Showing <b>{currentProducts.length}</b> of <b>{filtered.length}</b> items</span>
                {totalPages > 1 && <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>}
              </div>

              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <p className="font-serif text-2xl font-bold text-slate-900">No items match this combination</p>
                  <p className="mt-2 text-xs font-medium text-slate-600">Try selecting another filter or reset.</p>
                  <button
                    onClick={() => { setSectionFilter('all'); setTypeFilter('all'); setSeasonFilter('all'); setBandFilter('all'); setSearchQuery(''); }}
                    className="mt-6 rounded-full bg-[#1C3A2B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                  </button>

                  {getPaginationGroup().map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`h-10 w-10 rounded-xl text-xs font-bold transition shadow-sm ${
                          currentPage === item
                            ? 'bg-[#1C3A2B] text-white'
                            : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
