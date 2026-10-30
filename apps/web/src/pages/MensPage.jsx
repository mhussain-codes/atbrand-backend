import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Search, ChevronLeft, ChevronRight, Sparkles, BellRing, Filter } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { openWhatsApp } from '@/lib/whatsapp';

const SLUG_TO_TYPE = {
  'ahmad-cotton': 'Ahmad Cotton',
  'rashid-cotton': 'Rashid Cotton',
  'wash-and-wear': 'Wash & Wear',
  'boski': 'Boski',
  'khaddar': 'Khaddar',
  'lattha': 'Lattha',
  'karandi': 'Karandi'
};

const FABRIC_PILLS = [
  { id: 'all', label: 'All Men Fabrics', slug: '' },
  { id: 'ahmad-cotton', label: 'Ahmad Cotton', slug: 'ahmad-cotton' },
  { id: 'rashid-cotton', label: 'Rashid Cotton', slug: 'rashid-cotton' },
  { id: 'wash-and-wear', label: 'Wash & Wear', slug: 'wash-and-wear' },
  { id: 'boski', label: 'Boski', slug: 'boski' },
  { id: 'khaddar', label: 'Khaddar', slug: 'khaddar' },
  { id: 'lattha', label: 'Lattha', slug: 'lattha' },
  { id: 'karandi', label: 'Karandi', slug: 'karandi' }
];

export default function MensPage() {
  const { fabricSlug, slug } = useParams();
  const navigate = useNavigate();
  const currentSlug = fabricSlug || slug || '';
  
  const activeTypeFromUrl = currentSlug && SLUG_TO_TYPE[currentSlug.toLowerCase()]
    ? SLUG_TO_TYPE[currentSlug.toLowerCase()]
    : 'all';

  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [priceSort, setPriceSort] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
  }, [currentSlug, searchQuery, selectedSeason, priceSort]);

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        // Category / Type check
        if (activeTypeFromUrl !== 'all') {
          const typeMatch = (p.type || '').toLowerCase() === activeTypeFromUrl.toLowerCase();
          const nameMatch = (p.name || '').toLowerCase().includes(activeTypeFromUrl.toLowerCase());
          if (!typeMatch && !nameMatch) return false;
        }

        // Season filter
        if (selectedSeason !== 'all') {
          const pSeason = (p.season || '').toLowerCase();
          if (selectedSeason === 'summer' && !pSeason.includes('summer')) return false;
          if (selectedSeason === 'winter' && !pSeason.includes('winter')) return false;
          if (selectedSeason === '4-season' && !pSeason.includes('4 season') && !pSeason.includes('all')) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = (p.name || '').toLowerCase().includes(q);
          const matchesFabric = (p.fabric || '').toLowerCase().includes(q);
          if (!matchesName && !matchesFabric) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (priceSort === 'low-to-high') return a.price - b.price;
        if (priceSort === 'high-to-low') return b.price - a.price;
        return 0;
      });
  }, [products, activeTypeFromUrl, selectedSeason, searchQuery, priceSort]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const getPaginationGroup = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageTitle = activeTypeFromUrl !== 'all'
    ? `${activeTypeFromUrl} Men's Unstitched Suits | AT BRAND Sargodha`
    : `Men's Premium Unstitched Suits & Shalwar Kameez | AT BRAND Sargodha`;

  const pageDescription = activeTypeFromUrl !== 'all'
    ? `Buy authentic ${activeTypeFromUrl} unstitched suit fabric in Sargodha, Pakistan. 100% guarantee, fall, and nationwide cash on delivery by AT BRAND.`
    : `Explore premium men's unstitched suits: Ahmad Cotton, Rashid Cotton, Wash & Wear, Boski, and Khaddar at AT BRAND Sargodha. Cash on Delivery nationwide.`;

  const canonicalUrl = currentSlug
    ? `https://atbrand.store/men/${currentSlug}`
    : `https://atbrand.store/men`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://atbrand.store/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Men Collection',
        'item': 'https://atbrand.store/men'
      },
      ...(currentSlug ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': activeTypeFromUrl,
        'item': canonicalUrl
      }] : [])
    ]
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': pageTitle,
    'description': pageDescription,
    'url': canonicalUrl,
    'publisher': {
      '@type': 'Organization',
      'name': 'AT BRAND Sargodha',
      'url': 'https://atbrand.store'
    }
  };

  if (loading) return <BrandLoader message="Loading Men's Collection..." />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="mens unstitched suits Pakistan, unstitched shalwar kameez, Wash and Wear fabric Pakistan, Ahmad cotton Sargodha, Rashid cotton suits, Boski suits Pakistan, mens clothing Sargodha, unstitched suit box price" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(collectionJsonLd)}
        </script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">Men's Exclusive Collection</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#1C3A2B] sm:text-5xl">
            {activeTypeFromUrl !== 'all' ? `${activeTypeFromUrl} Collection` : 'Premium Unstitched Fabrics'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-700 sm:text-base">
            Crafted for the modern Pakistani gentleman. Superior drape, breathable pure cottons, and rich seasonal fabrics.
          </p>
        </div>

        {/* Sub-Category Navigation Pills */}
        <div className="mb-8 flex overflow-x-auto pb-2 scrollbar-none sm:justify-center">
          <div className="inline-flex gap-2">
            {FABRIC_PILLS.map((pill) => {
              const isActive = (!currentSlug && pill.id === 'all') || (currentSlug.toLowerCase() === pill.slug.toLowerCase());
              const targetUrl = pill.slug ? `/men/${pill.slug}` : '/men';
              return (
                <Link
                  key={pill.id}
                  to={targetUrl}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1C3A2B] text-white shadow-md ring-2 ring-[#C5A880]'
                      : 'border border-slate-300 bg-white text-slate-700 hover:border-[#1C3A2B] hover:text-[#1C3A2B]'
                  }`}
                >
                  {pill.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search within ${activeTypeFromUrl !== 'all' ? activeTypeFromUrl : "Men's Collection"} (colors, names)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#1C3A2B] focus:outline-none"
            >
              <option value="all">All Seasons</option>
              <option value="summer">Summer Collection</option>
              <option value="winter">Winter Collection</option>
              <option value="4-season">4 Season Wear</option>
            </select>

            {/* Price Sort */}
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
          <span>Showing <b>{currentProducts.length}</b> of <b>{filtered.length}</b> suits in <b>{activeTypeFromUrl !== 'all' ? activeTypeFromUrl : 'All Fabrics'}</b></span>
          {totalPages > 1 && <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>}
        </div>

        {/* Product Grid or Coming Soon State */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto my-12">
            <Sparkles className="mx-auto h-12 w-12 text-[#C5A880] mb-4 animate-pulse" />
            <h2 className="font-serif text-2xl font-bold text-[#1C3A2B] uppercase tracking-wide">
              {activeTypeFromUrl !== 'all'
                ? `${activeTypeFromUrl} Stock Updating / Coming Soon`
                : 'No Matching Products Found'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {activeTypeFromUrl !== 'all'
                ? `Hamare paas ${activeTypeFromUrl} ka naya stock jald live ho raha hai. Agar aapko yeh fabric foran darkaar hai toh hamare WhatsApp par rabta karein.`
                : 'Try clearing filters or search terms to see all available suits.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => openWhatsApp(`Assalam-o-Alaikum! Please notify me when fresh stock of ${activeTypeFromUrl !== 'all' ? activeTypeFromUrl : "Men's suits"} is available.`)}
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#20ba59]"
              >
                <BellRing className="h-4 w-4" />
                Notify Me on WhatsApp
              </button>
              <button
                onClick={() => { navigate('/men'); setSelectedSeason('all'); setSearchQuery(''); }}
                className="rounded-full border border-[#1C3A2B] px-6 py-2.5 text-xs font-bold text-[#1C3A2B] hover:bg-slate-50 shadow-sm"
              >
                View All Men's Fabrics
              </button>
            </div>
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
        {/* Educational SEO & Fabric Guide Section */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          <h2 className="font-serif text-lg font-bold text-[#1C3A2B] sm:text-xl">
            Why Buy Men's Unstitched Fabric from AT BRAND Sargodha?
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            At <strong>AT BRAND</strong>, we curate premier Pakistani unstitched fabrics directly from renowned mills and master weavers across Kamalia, Faisalabad, and Karachi. Whether you are looking for crisp Ahmad Cotton with stiff collar fall, everyday wash-and-wear for work, luxurious executive Boski for wedding ceremonies, or warm winter khaddar, every 4-meter / 4.25-meter suit piece comes with our 100% color and fabric guarantee, custom tailoring add-ons, and nationwide cash on delivery across Pakistan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-[#1C3A2B]">
            <span className="rounded-lg bg-white px-2.5 py-1 border border-slate-200">✓ 4.0 - 4.5 Meter Standard Cutting</span>
            <span className="rounded-lg bg-white px-2.5 py-1 border border-slate-200">✓ 100% Color & Shrinkage Guarantee</span>
            <span className="rounded-lg bg-white px-2.5 py-1 border border-slate-200">✓ Luxury Packaging with Original Bag</span>
            <span className="rounded-lg bg-white px-2.5 py-1 border border-slate-200">✓ Sargodha Master Tailoring Available</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
