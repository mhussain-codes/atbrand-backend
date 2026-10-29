import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';

export default function MensPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [priceSort, setPriceSort] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Exactly 8 items per page for clean look

  useEffect(() => {
    fetch('/api/products?category=Men')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery, priceSort]);

  const types = ['all', 'Ahmad Cotton', 'Rashid Cotton', 'Wash & Wear', 'Boski', 'Khaddar', 'Lattha'];

  const filtered = products
    .filter(p => {
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (priceSort === 'low-to-high') return a.price - b.price;
      if (priceSort === 'high-to-low') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
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

  if (loading) return <BrandLoader message="Loading Men's Collection..." />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Helmet>
        <title>Men's Premium Unstitched Suits & Shalwar Kameez | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Explore the finest Men's unstitched suits in Pakistan. Wash & Wear, Ahmad Cotton, Rashid Cotton, Boski, and Lattha delivered nationwide."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">Men's Exclusive Collection</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#1C3A2B] sm:text-5xl">
            Premium Unstitched Fabrics
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-700 sm:text-base">
            Crafted for the modern Pakistani gentleman. Superior drape, breathable cottons, and rich winter fabrics.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search fabrics, colors, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#1C3A2B] focus:outline-none"
            >
              {types.map(t => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Fabric Types' : t}
                </option>
              ))}
            </select>

            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#1C3A2B] focus:outline-none"
            >
              <option value="default">Default Sorting</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="mb-6 flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-200 pb-2">
          <span>Showing <b>{currentProducts.length}</b> of <b>{filtered.length}</b> suits</span>
          {totalPages > 1 && <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>}
        </div>

        {/* Product Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-bold text-slate-800">No matching products found</p>
            <p className="mt-1 text-sm text-slate-600">Try clearing filters or search term.</p>
            <button
              onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
              className="mt-4 rounded-full bg-[#1C3A2B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
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
      </main>

      <Footer />
    </div>
  );
}
