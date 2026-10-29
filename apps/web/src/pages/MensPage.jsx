import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS } from '@/data/products';

export default function MensPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [priceSort, setPriceSort] = useState('default');

  useEffect(() => {
    fetch('/api/products?category=Men')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Keeps fallback 51 items
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <BrandLoader message="Loading Men's Collection..." />;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Men's Exclusive Collection</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Premium Unstitched Fabrics
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Crafted for the modern Pakistani gentleman. Superior drape, breathable cottons, and rich winter fabrics.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search fabrics, colors, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
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
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="default">Default Sorting</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-lg font-medium text-foreground">No matching products found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or search term.</p>
            <button
              onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
