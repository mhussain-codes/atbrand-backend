import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Sparkles, ShoppingBag, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WomensPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=Women')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          const womenOnly = data.products.filter(p => (p.category || '').toLowerCase() === 'women');
          setProducts(womenOnly);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const womenFaqs = [
    {
      q: "What types of unstitched fabrics are in the Women's Collection?",
      a: "Our women's seasonal line features premium breathable lawn, Swiss voile, jacquard, embroidered organza, and winter khaddar suits curated with elegant Pakistani silhouettes."
    },
    {
      q: "Can I get custom tailoring for women's unstitched suits?",
      a: "Yes! AT BRAND offers custom tailoring options where you can submit personal measurements for stitching with nationwide Cash on Delivery."
    },
    {
      q: "Does AT BRAND offer Cash on Delivery across Pakistan for women's suits?",
      a: "Yes, every order qualifies for nationwide Cash on Delivery across Lahore, Karachi, Islamabad, Sargodha, Faisalabad, and all surrounding areas with a 7-day return policy."
    },
    {
      q: "How do I check new arrivals and seasonal discounts on women's dresses?",
      a: "New arrivals and limited edition volumes are released each season on atbrand.store and shared with our VIP WhatsApp community with special seasonal promotions."
    }
  ];

  const womenFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': womenFaqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  const breadcrumbSchema = {
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
        'name': "Women's Collection",
        'item': 'https://atbrand.store/women'
      }
    ]
  };

  if (loading) return <BrandLoader message="Loading Women's Collection..." />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Women's Unstitched Lawn, Luxury Pret & Traditional Suits | AT BRAND</title>
        <meta
          name="description"
          content="Shop AT BRAND Women's Collection. Premium unstitched summer lawn, luxury pret, winter khaddar, and festive embroidered suits with Cash on Delivery across Pakistan."
        />
        <link rel="canonical" href="https://atbrand.store/women" />
        <meta property="og:title" content="Women's Unstitched Lawn & Designer Suits | AT BRAND Pakistan" />
        <meta property="og:description" content="Discover exquisite women's unstitched suits, luxury lawn, and traditional dresses with Cash on Delivery." />
        <meta property="og:url" content="https://atbrand.store/women" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(womenFaqSchema)}</script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C5A880]">Exquisite Craftsmanship</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1C3A2B] sm:text-5xl">
            Women's Premium Line
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Curated pret and unstitched silhouettes designed with breathable fabrics, intricate motifs, and timeless grace across Pakistan.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm sm:p-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1C3A2B]/10 text-[#1C3A2B]">
              <Sparkles className="h-8 w-8 text-[#C5A880]" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold text-[#1C3A2B]">New Season Launching Soon</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Hamare artisans new seasonal collection par kaam kar rahe hain. Jald hi unstitched lawn aur festive designs live hongi. Aap abhi hamari Men's collection dekh saktay hain.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/men"
                className="inline-flex items-center gap-2 rounded-full bg-[#1C3A2B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow transition hover:opacity-95"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Men's Collection
              </Link>
            </div>
          </div>
        )}

        {/* Women SEO Q&A Accordion */}
        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">
            Sawal Jawab (Frequently Asked Questions)
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C3A2B]">
            Women's Dresses &amp; Fabrics — Common Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Essential information regarding fabrics, custom sizing, seasonal drops, and delivery policies.
          </p>

          <div className="mt-6 space-y-3.5">
            {womenFaqs.map((faq, idx) => (
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

          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#1C3A2B]">
            <Link to="/men" className="hover:text-[#C5A880] underline">Men's Unstitched Suits</Link>
            <Link to="/stitching" className="hover:text-[#C5A880] underline">Custom Darzi Stitching</Link>
            <Link to="/shipping-policy" className="hover:text-[#C5A880] underline">Cash on Delivery Info</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
