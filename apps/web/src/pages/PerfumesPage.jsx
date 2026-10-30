import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BrandLoader from '@/components/BrandLoader';
import { Helmet } from 'react-helmet';
import { Sparkles, BellRing, ChevronDown } from 'lucide-react';
import { openWhatsApp } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

export default function PerfumesPage() {
  const [products, setProducts] = useState([]);
  const [isComingSoon, setIsComingSoon] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=Perfumes')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          const perfumesOnly = data.products.filter(p => (p.category || '').toLowerCase() === 'perfumes');
          if (perfumesOnly.length > 0) {
            setProducts(perfumesOnly);
            setIsComingSoon(false);
          } else {
            setProducts([]);
            setIsComingSoon(true);
          }
        }
      })
      .catch(() => {
        setProducts([]);
        setIsComingSoon(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const perfumeFaqs = [
    {
      q: "What makes AT BRAND perfumes long-lasting in Pakistan's weather?",
      a: "Our artisanal fragrances use high-concentration French fragrance compounds and pure essential oils formulated for high projection and 12+ hour longevity even in hot summer heat."
    },
    {
      q: "Are AT BRAND perfumes alcohol-free concentrated attars or EDP spray perfumes?",
      a: "The collection includes both pure non-alcoholic concentrated oils (Attar) for traditional application and luxury Eau de Parfum (EDP) atomizers for daily executive wear."
    },
    {
      q: "Which fragrance notes are featured in the collection?",
      a: "Our signature olfactory library includes Royal Cambodian Oudh, Amber Imperial, Taif Rose, Smoky Leather, Bergamot, and Fresh Aquatic accords suited for formal gatherings and daily wear."
    },
    {
      q: "How can I order perfumes online with Cash on Delivery in Pakistan?",
      a: "You can place your perfume order directly on atbrand.store or via WhatsApp. We deliver securely packed fragrance bottles across all cities of Pakistan with 100% Cash on Delivery."
    }
  ];

  const perfumeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': perfumeFaqs.map(f => ({
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
        'name': 'Perfumes & Fragrances',
        'item': 'https://atbrand.store/perfumes'
      }
    ]
  };

  if (loading) return <BrandLoader message="Loading Fragrance Lounge..." />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Luxury Perfumes, Attars & Long-Lasting Fragrances in Pakistan | AT BRAND</title>
        <meta
          name="description"
          content="Explore artisanal non-alcoholic attars, French perfumes, and royal Oud fragrances by AT BRAND Sargodha. Long-lasting scent projection with Cash on Delivery across Pakistan."
        />
        <link rel="canonical" href="https://atbrand.store/perfumes" />
        <meta property="og:title" content="Luxury Perfumes & Long-Lasting Attars | AT BRAND Pakistan" />
        <meta property="og:description" content="Artisanal Oriental and French perfumery by AT BRAND Sargodha. Long-lasting scents with Cash on Delivery nationwide." />
        <meta property="og:url" content="https://atbrand.store/perfumes" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(perfumeFaqSchema)}</script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C5A880]">Artisanal Scent Atelier</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#1C3A2B] sm:text-6xl">
            AT BRAND PERFUMES
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Long-lasting pure oils, opulent Royal Oudh, Amber, and modern fresh French fragrances designed for enduring distinction in Pakistan.
          </p>
        </div>

        {isComingSoon || products.length === 0 ? (
          <div className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-[#FAF8F5] p-10 text-center shadow-lg sm:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1C3A2B]/10 text-[#1C3A2B]">
              <Sparkles className="h-10 w-10 animate-pulse text-[#C5A880]" />
            </div>

            <h2 className="mt-8 font-serif text-3xl font-bold tracking-wider text-[#1C3A2B]">
              SIGNATURE LAUNCH COMING SOON
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Hamare master perfumers natural distilled accords aur luxury bottles tayar kar rahe hain. Naye scents ka launch jald announce kiya jaye ga.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => openWhatsApp("Assalam-o-Alaikum! Please notify me when AT BRAND Perfumes are officially launched.")}
                className="inline-flex items-center gap-2 rounded-full bg-[#1C3A2B] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white shadow transition hover:opacity-90 active:scale-95"
              >
                <BellRing className="h-4 w-4" />
                Notify Me on WhatsApp
              </button>
              <Link
                to="/men"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Explore Men's Fabrics
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Perfume SEO Q&A Accordion */}
        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">
            Sawal Jawab (Frequently Asked Questions)
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C3A2B]">
            AT BRAND Perfumes &amp; Attars — Essential Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Learn about our scent formulations, projection longevity, non-alcoholic blends, and nationwide delivery.
          </p>

          <div className="mt-6 space-y-3.5">
            {perfumeFaqs.map((faq, idx) => (
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
            <Link to="/men" className="hover:text-[#C5A880] underline">Men's Unstitched Collection</Link>
            <Link to="/stitching" className="hover:text-[#C5A880] underline">Custom Suit Tailoring</Link>
            <Link to="/shipping-policy" className="hover:text-[#C5A880] underline">Cash on Delivery &amp; Shipping</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
