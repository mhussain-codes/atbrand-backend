import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Search, ChevronLeft, ChevronRight, Sparkles, BellRing, Filter, ChevronDown } from 'lucide-react';
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
    ? `Browse available ${activeTypeFromUrl} men's unstitched shalwar kameez suits at AT BRAND Sargodha. See current colours and product details, with delivery options across Pakistan.`
    : `Explore premium men's unstitched suits: Ahmad Cotton, Rashid Cotton, Wash & Wear, Boski, and Khaddar at AT BRAND Sargodha. Cash on Delivery nationwide.`;

  const canonicalUrl = currentSlug
    ? `https://atbrand.store/men/${currentSlug}`
    : `https://atbrand.store/men`;

  const fabricFaqs = useMemo(() => {
    if (activeTypeFromUrl === 'Ahmad Cotton') {
      return [
        {
          q: "What makes Ahmad Cotton the best choice for men's unstitched suits in Pakistan?",
          a: "Ahmad Cotton is woven from fine-count combed cotton yarn that provides crisp collar fall (kadak istari), maximum breathability in summer heat, and natural colorfastness without pilling or burr."
        },
        {
          q: "Which season is Ahmad Cotton ideal for?",
          a: "Ahmad Cotton is specifically engineered for Pakistani spring, summer, and humid weather due to its lightweight, moisture-wicking natural cotton weave."
        },
        {
          q: "How should I wash and shrink Ahmad Cotton before tailoring?",
          a: "Always soak the unstitched suit fabric in plain cold water for 2 hours before giving it to your tailor for stitching. Avoid chemical bleach and dry in shaded air."
        },
        {
          q: "Can I get custom tailoring and stitching bundled with Ahmad Cotton?",
          a: "Yes! AT BRAND provides bespoke custom stitching by master tailors with an interactive 3D fit visualizer for a flat fee of PKR 1,500."
        }
      ];
    }
    if (activeTypeFromUrl === 'Rashid Cotton') {
      return [
        {
          q: "What is the difference between Rashid Winter Cotton and regular cotton?",
          a: "Rashid Winter Cotton features a denser, heavier yarn structure that retains body warmth during cold months while maintaining a smooth, structured drape."
        },
        {
          q: "Does Rashid Cotton require starch (Kalaf)?",
          a: "Rashid Cotton possesses an inherent crisp fall. It holds its collar shape, cuffs, and trouser crease naturally with medium steam ironing."
        },
        {
          q: "How long does delivery take for Rashid Cotton suits across Pakistan?",
          a: "Orders are dispatched directly from our Sargodha store and delivered within 2 to 4 working days with 100% Cash on Delivery nationwide."
        }
      ];
    }
    if (activeTypeFromUrl === 'Wash & Wear') {
      return [
        {
          q: "Why is Wash & Wear fabric the most popular men's fabric in Pakistan?",
          a: "Wash & Wear resists wrinkles throughout the day, requires minimal pressing, dries quickly, and maintains an executive graceful fall through long office and travel hours."
        },
        {
          q: "Can Wash & Wear suits be worn in all 4 seasons?",
          a: "Yes, AT BRAND's four-season Wash & Wear balances breathable poly-viscose microfibers with soft skin-friendly texture suitable throughout the year."
        },
        {
          q: "Is Wash & Wear suitable for custom sherwani ban and cuff tailoring?",
          a: "Yes! Wash & Wear holds stiff collar interlining (bukram) cleanly with sharp cuffs and straight paincha fall."
        }
      ];
    }
    if (activeTypeFromUrl === 'Boski') {
      return [
        {
          q: "What is pure executive Boski fabric?",
          a: "Boski is a prestigious spun-silk weave revered across Pakistan for wedding ceremonies, Eid, and formal gatherings, offering featherweight softness and creamy ivory luster."
        },
        {
          q: "How to identify original Boski from synthetic copies?",
          a: "Original Boski features a distinct cool silk touch, natural fluid drape without stiffness, and a rich matte sheen without synthetic shine."
        },
        {
          q: "How should Boski suits be washed and maintained?",
          a: "Dry cleaning or gentle hand wash with mild silk detergent is recommended. Always iron slightly damp on a silk/low temperature setting."
        }
      ];
    }
    if (activeTypeFromUrl === 'Khaddar') {
      return [
        {
          q: "What makes Kamalia Winter Khaddar unique?",
          a: "Woven on traditional looms from thick-twist natural cotton yarn, genuine Khaddar offers unmatched heritage texture, wind resistance, and winter warmth."
        },
        {
          q: "Does winter Khaddar shrink after washing?",
          a: "Yes, natural handloom khaddar can shrink 1 to 2 inches; always soak and shrink thoroughly in water prior to cutting and stitching."
        }
      ];
    }
    return [
      {
        q: "What is the standard cutting size for AT BRAND men's unstitched suits?",
        a: "Every men's unstitched suit comes in a generous 4.0 to 4.25-meter standard cutting with full 54-inch width (arzz), suitable for heights up to 6'2\" with ample cloth for shalwar kameez or kurta pajama."
      },
      {
        q: "Which fabric is best for daily wear: Ahmad Cotton or Wash & Wear?",
        a: "For hot summer days, pure Ahmad Cotton is unmatched for cooling breathability. For busy office and daily routines where wrinkle-resistance is needed, Wash & Wear is ideal."
      },
      {
        q: "How does online custom tailoring work at AT BRAND?",
        a: "You can enter your exact length, chest, shoulder, and shalwar dimensions into our interactive 3D tailoring visualizer; our Sargodha master tailors cut and stitch your suit for flat PKR 1,500."
      },
      {
        q: "Does AT BRAND offer a 100% color and fabric guarantee?",
        a: "Yes, every suit comes with a 100% genuine fabric guarantee, colorfastness warranty, and a 7-day easy return policy with Cash on Delivery across Pakistan."
      }
    ];
  }, [activeTypeFromUrl]);

  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': fabricFaqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  }), [fabricFaqs]);

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
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">Men's Exclusive Collection</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#1C3A2B] sm:text-5xl">
            {activeTypeFromUrl !== 'all'
              ? `${activeTypeFromUrl} Men's Unstitched Suits`
              : "Men's Unstitched Shalwar Kameez Suits"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-700 sm:text-base">
            {activeTypeFromUrl !== 'all'
              ? `Browse the current ${activeTypeFromUrl} men's unstitched suit colours and product details below. Check each listing for its latest price and availability, then choose an ordering option for delivery across Pakistan.`
              : 'Browse current fabric collections, available colours and product details. Check each listing for its latest price and availability, then choose an ordering option for delivery across Pakistan.'}
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
        {/* People Also Ask / High-Intent Q&A Section */}
        {fabricFaqs && fabricFaqs.length > 0 && (
          <div className="mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">
              Sawal Jawab (Frequently Asked Questions)
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C3A2B]">
              {activeTypeFromUrl !== 'all'
                ? `${activeTypeFromUrl} Suits — Ahem Sawalat Aur Jawabat`
                : "Men's Unstitched Fabrics — Essential Q&A"}
            </h2>
            <div className="mt-6 space-y-3.5">
              {fabricFaqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-slate-200/80 p-4 transition open:border-[#1C3A2B]/40 open:bg-slate-50/60"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Product and service guidance */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          <h2 className="font-serif text-lg font-bold text-[#1C3A2B] sm:text-xl">
            {activeTypeFromUrl === 'all' ? 'Choosing a Men’s Unstitched Suit' : `About ${activeTypeFromUrl} Suits`}
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            {activeTypeFromUrl === 'all'
              ? 'Compare the current fabric types, seasons and prices using the filters above. Each product page shows its available photos, listed fabric details and current price. Review those details before ordering, and contact AT BRAND if you need a measurement or fabric-length detail confirmed.'
              : `Browse the current ${activeTypeFromUrl} listings and compare the photos, fabric notes and prices shown on each product page. Product details can differ by item; contact AT BRAND if you need a measurement or fabric-length detail confirmed before ordering.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#1C3A2B]">
            <Link to="/size-guide" className="underline underline-offset-2 hover:text-[#7A6548]">Men’s size and measurement guide</Link>
            <Link to="/stitching" className="underline underline-offset-2 hover:text-[#7A6548]">Custom stitching options</Link>
            <Link to="/shipping-policy" className="underline underline-offset-2 hover:text-[#7A6548]">Shipping times and COD</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
