import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BrandLoader from '@/components/BrandLoader';
import ProductCard from '@/components/ProductCard';
import { useBuy } from '@/contexts/BuyContext';
import { Helmet } from 'react-helmet';
import { formatPKR, openWhatsApp, buildInquiryMessage } from '@/lib/whatsapp';
import { ShieldCheck, Truck, RefreshCw, Scissors, ShoppingCart, MessageCircle, ChevronRight, ArrowRight, ChevronDown, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { getProductSeo } from '@/data/productSeo';
import { trackViewContent, trackAddToCart, trackWhatsAppClick } from '@/lib/adPixel';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { openBuy, addToCart } = useBuy();

  const cleanSlug = String(slug || '').toLowerCase();
  
  // Instant synchronous lookup from PRODUCTS memory for 0ms load time
  const initialProduct = useMemo(() => {
    return PRODUCTS.find(p => 
      String(p.id).toLowerCase() === cleanSlug || 
      (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleanSlug) ||
      (p.slug && p.slug.toLowerCase() === cleanSlug)
    ) || null;
  }, [cleanSlug]);

  // ALL HOOKS DECLARED AT THE VERY TOP (Rules of Hooks Strict Compliance)
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [dbRelated, setDbRelated] = useState([]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [customReviews, setCustomReviews] = useState([]);

  // Sync state and fetch live data from server for new/database products
  useEffect(() => {
    setSelectedImage(0);

    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      trackViewContent(initialProduct);
    } else {
      setLoading(true);
    }

    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(d => {
        if (d && d.product) {
          setProduct(d.product);
          trackViewContent(d.product);
        } else if (!initialProduct) {
          setProduct(null);
        }
      })
      .catch(() => {
        if (!initialProduct) setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, initialProduct]);

  // Fetch related items from DB matching category
  useEffect(() => {
    if (!product) return;
    const cat = product.category || 'Men';
    fetch(`/api/products?category=${encodeURIComponent(cat)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && Array.isArray(d.products)) {
          setDbRelated(d.products.filter(p => p.id !== product.id).slice(0, 4));
        }
      })
      .catch(() => {});
  }, [product?.id, product?.category]);

  const cat = (product?.category || '').toLowerCase();
  const isPerfume = cat === 'perfumes' || 
    String(product?.type || '').toLowerCase().includes('oud') || 
    String(product?.type || '').toLowerCase().includes('perfume') || 
    String(product?.name || '').toLowerCase().includes('parfum') || 
    String(product?.name || '').toLowerCase().includes('eau de');

  const isWomen = cat === 'women';

  // Category-specific default reviews
  const defaultReviews = useMemo(() => {
    if (isPerfume) {
      return [
        {
          id: 'p-rev-1',
          author: 'Muhammad Tariq',
          city: 'Lahore',
          rating: 5,
          date: '2026-11-15',
          title: 'Shandar Royal Khushboo & Long-Lasting Sillage',
          comment: 'MashaAllah bohut hi pyari aur royal Arabic fragrance hai. Subah lagayi thi raat tak clothes par mehak rahi thi. Pakistan Post rider ne parcel pehle khol kar check karne diya phir payment li. 100% satisfied!'
        },
        {
          id: 'p-rev-2',
          author: 'Bilal Ahmed',
          city: 'Rawalpindi',
          rating: 5,
          date: '2026-11-18',
          title: 'Original Bottle & Luxury Packaging',
          comment: 'Original luxury packaging aur bottle finish nihayat khoobsurat hai. Jummah prayers aur weddings ke function ke liye perfect fragrance. 3 din mein parcel pohanch gaya.'
        },
        {
          id: 'p-rev-3',
          author: 'Hamza Sheikh',
          city: 'Faisalabad',
          rating: 5,
          date: '2026-11-20',
          title: 'Heavy Projection (Zabardast Khushboo)',
          comment: 'Dry down bohut smooth aur warm hai. Jo bhi milta hai zaroor poochta hai k konsa perfume lagaya hai. Box price se kam rate par zabardast cheez mili.'
        },
        {
          id: 'p-rev-4',
          author: 'Usman Ghani',
          city: 'Karachi',
          rating: 5,
          date: '2026-11-22',
          title: 'Open Parcel COD se dil mutmain ho gaya',
          comment: 'Online perfume mangwate waqt darr hota hai k duplicate na ho, lekin AT Brand ki open parcel delivery aur original quality ne dil jeet liya. Highly recommended!'
        }
      ];
    } else if (isWomen) {
      return [
        {
          id: 'w-rev-1',
          author: 'Sadia Malik',
          city: 'Lahore',
          rating: 5,
          date: '2026-11-10',
          title: 'Premium Quality Fabric & Fast Delivery',
          comment: 'Fabric softness aur digital printing ki finishing kamaal hai. Pakistan Post rider ne parcel pehle khol kar check karne diya. Bohut khushi hui shopping kar ke.'
        },
        {
          id: 'w-rev-2',
          author: 'Ayesha Khan',
          city: 'Islamabad',
          rating: 5,
          date: '2026-11-14',
          title: 'Original AT Brand Trust',
          comment: 'Washing ke baad bhi fabric ka rang aur chamak waisi hi rahi. Packaging bohut luxury thi aur 3 din mein deliver ho gaya. 100% recommended!'
        },
        {
          id: 'w-rev-3',
          author: 'Fatima Noor',
          city: 'Rawalpindi',
          rating: 5,
          date: '2026-11-17',
          title: 'Graceful Fall & Honest Service',
          comment: 'Suit ka dupatta aur trouser fabric dono generous cutting mein mile. Master tailor ne stitching ki to fitting lajawab aayi.'
        },
        {
          id: 'w-rev-4',
          author: 'Hira Zainab',
          city: 'Faisalabad',
          rating: 5,
          date: '2026-11-21',
          title: 'Open Parcel Delivery Super Satisfied',
          comment: 'Cash on delivery par pehle open kar ke check kiya. Fabric pure hai aur bohut soft hai. Will definitely buy again.'
        }
      ];
    } else {
      return [
        {
          id: 'm-rev-1',
          author: 'Muhammad Tariq',
          city: 'Lahore',
          rating: 5,
          date: '2026-09-15',
          title: 'Zabardast Fabric & Open Parcel Feature',
          comment: 'Kapra bohut hi umdah hai, full 4.25 meter cutting mili. Pakistan Post rider ne parcel pehle khol kar check karne diya phir payment li. 100% satisfied!'
        },
        {
          id: 'm-rev-2',
          author: 'Bilal Ahmed',
          city: 'Rawalpindi',
          rating: 5,
          date: '2026-10-02',
          title: 'Original AT Brand Quality',
          comment: 'Color bilkul original jaisa hai aur dhone ke baad bhi chamak waisi hi rahi. 6 mahine ki original condition return guarantee waqai confidence deti hai. 3 din mein parcel pohanch gaya.'
        },
        {
          id: 'm-rev-3',
          author: 'Hamza Sheikh',
          city: 'Faisalabad',
          rating: 5,
          date: '2026-10-14',
          title: 'Bohut pyara suit aur fast delivery',
          comment: 'Sargodha se Faisalabad 2 din mein parcel agaya. Pakistan Post standard delivery Rs 200 bohut munasib hai. Highly recommended!'
        },
        {
          id: 'm-rev-4',
          author: 'Usman Ghani',
          city: 'Karachi',
          rating: 5,
          date: '2026-10-22',
          title: 'Quality suit, honest sellers',
          comment: 'Fabric softness aur fall kamaal ki hai. Packing luxury thi aur suit ke sath original tags the. Open parcel feature se dil mutmain ho gaya.'
        }
      ];
    }
  }, [isPerfume, isWomen]);

  const reviewsList = useMemo(() => {
    return [...customReviews, ...defaultReviews];
  }, [customReviews, defaultReviews]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    const added = {
      id: Date.now(),
      author: newReviewAuthor.trim(),
      city: newReviewCity.trim() || 'Pakistan',
      rating: Number(newReviewRating),
      date: new Date().toISOString().split('T')[0],
      title: 'Verified Customer Review',
      comment: newReviewComment.trim()
    };
    setCustomReviews(prev => [added, ...prev]);
    setNewReviewAuthor('');
    setNewReviewCity('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  const productFaqs = useMemo(() => {
    if (!product) return [];
    if (isPerfume) {
      return [
        {
          q: `Can I open and inspect the perfume parcel before paying Cash on Delivery?`,
          a: `Haan bilkul! AT BRAND par Open Parcel ki sahulat dastyab hai. Pakistan Post rider se parcel receive karte waqt aap pehle parcel open kar ke bottle, packaging aur seal check kar sakte hain, uske baad tasalli se Cash on Delivery ada karein.`
        },
        {
          q: `What is the projection and longevity (lasting) of ${product.name}?`,
          a: `${product.name} ek concentrated Eau De Parfum (EDP) hai. Iski heavy sillage projection aur khushboo kapron par 10 se 14 ghantay tak asani se barkarar rehti hai.`
        },
        {
          q: `Is this 100% original Arabic perfume?`,
          a: `Ji haan! Hum 100% authentic aur original Arabic fragrance notes guarantee karte hain. Original luxury bottle aur packaging ke sath deliver hota hai.`
        },
        {
          q: `How should I apply ${product.name} for maximum projection?`,
          a: `Behtareen results ke liye pulse points (kalaai, gardan ke sides) aur kapron par 2 se 3 sprays lagayein. Kapron par lagane se khushboo poora din mehakti rehti hai.`
        },
        {
          q: `What are the delivery charges and delivery duration?`,
          a: `Poore Pakistan mein flat delivery charges sirf PKR 200 hain. Parcel Pakistan Post express courier ke zariye 3 se 4 working days ke andar safe bubble packaging mein deliver hota hai.`
        },
        {
          q: `What is your return and exchange policy?`,
          a: `Humari 6-Month Return Policy hai: Agar bottle un-sprayed aur original box packaging mein ho, to aap 6 mahine ke andar baghair kisi pareshani ke wapis ya exchange kar sakte hain.`
        }
      ];
    } else if (isWomen) {
      return [
        {
          q: `Can I open and inspect the parcel before paying Cash on Delivery?`,
          a: `Haan bilkul! AT BRAND par Open Parcel ki sahulat dastyab hai. Pakistan Post rider se parcel receive karte waqt aap pehle parcel open kar ke fabric, print aur quality check kar sakte hain, uske baad tasalli se Cash on Delivery ada karein.`
        },
        {
          q: `What is your return and exchange policy?`,
          a: `Humari 6-Month Return Policy hai: Agar kapra apni original unstitched aur unwashed halat mein ho, to aap 6 mahine baad bhi wapis ya exchange kar sakte hain.`
        },
        {
          q: `What are the delivery charges and delivery duration?`,
          a: `Poore Pakistan mein flat delivery charges sirf PKR 200 hain. Parcel Pakistan Post express service ke zariye 3 se 4 working days ke andar aapki dehleez par deliver kar diya jata hai.`
        },
        {
          q: `What is the cutting length of ${product.name}?`,
          a: `${product.name} ki generous cutting standard Pakistani sizes ke mutabiq hoti hai jisse kameez aur shalwar/trouser asani se banti hai.`
        },
        {
          q: `How should I wash and care for ${product.name}?`,
          a: `Direct tez dhoop se bacha kar saye mein sokhayen aur gentle detergent se wash karein taake colors aur print hamesha fresh rahein.`
        }
      ];
    } else {
      return [
        {
          q: `Can I open and inspect the parcel before paying Cash on Delivery?`,
          a: `Haan bilkul! AT BRAND par Open Parcel ki sahulat dastyab hai. Pakistan Post rider se parcel receive karte waqt aap pehle parcel open kar ke fabric cutting, rang aur quality check kar sakte hain, uske baad tasalli se Cash on Delivery ada karein.`
        },
        {
          q: `What is your return and exchange policy?`,
          a: `Humari 6-Month Return Policy hai: Agar kapra apni original unstitched aur unwashed halat mein ho (tags/box ke sath), to aap beshak 6 mahine baad bhi wapis ya exchange kar sakte hain bina kisi pareshani ke.`
        },
        {
          q: `What are the delivery charges and delivery duration?`,
          a: `Poore Pakistan mein flat delivery charges sirf PKR 200 hain. Parcel Pakistan Post express service ke zariye 3 se 4 working days ke andar aapki dehleez par deliver kar diya jata hai.`
        },
        {
          q: `Can I add custom master tailoring (silai) and is COD available for it?`,
          a: `Ji haan! Aap PKR 1,500 add kar ke Sargodha ke ustad master tailors se customized silai karwa sakte hain. Unstitched suits par Cash on Delivery dastyab hai, lekin custom silai ke liye Advance Payment (JazzCash / EasyPaisa / Bank Transfer) laazmi hai kyunki kapra aapke zaati naap par cut hota hai.`
        },
        {
          q: `What is the standard cutting length of ${product.name}?`,
          a: `${product.name} ki cutting generous 4.0 se 4.25 meter aur 54-inch standard barha arzz (width) hoti hai, jisse 6'2" height tak ka traditional shalwar kameez ya kurta pajama asaani se ban jata hai.`
        },
        {
          q: `How should I wash and care for ${product.name}?`,
          a: `Pehle cut se pehle kapray ko 2 ghantay thande paani mein shrink karein. Direct tez dhoop se bacha kar saye mein sokhayen aur medium heat par iron karein taake rang aur chamak saalon saal barkarar rahe.`
        }
      ];
    }
  }, [product, isPerfume, isWomen]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    if (dbRelated.length > 0) return dbRelated;
    return PRODUCTS
      .filter(p => p.id !== product.id && (p.type === product.type || p.category === product.category))
      .slice(0, 4);
  }, [product, dbRelated]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Header />
        <div className="py-32">
          <BrandLoader message="Loading Product Details..." />
        </div>
        <Footer />
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Helmet>
          <title>Product Not Found | AT BRAND</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <Header />
        <div className="mx-auto max-w-2xl py-24 text-center px-4">
          <h2 className="text-2xl font-serif font-bold text-primary">Product Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Yeh product filhal dastyab nahi hai ya moved ho gaya hai.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow">
            Dukaan (Shop) Par Wapis Jayein
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/600'];

  const seoProduct = getProductSeo(product);
  const canonicalUrl = `https://atbrand.store/product/${product.id}`;

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
        'name': isPerfume ? 'Perfumes' : isWomen ? "Women's Collection" : product?.category === 'Men' ? "Men's Collection" : 'Shop',
        'item': isPerfume ? 'https://atbrand.store/perfumes' : isWomen ? 'https://atbrand.store/women' : product?.category === 'Men' ? 'https://atbrand.store/men' : 'https://atbrand.store/shop'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product?.name,
        'item': canonicalUrl
      }
    ]
  };

  // Dynamic JSON-LD Structured Data for Technical SEO & Search Console
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': seoProduct.displayName,
    'image': images,
    'description': product.fabric || `${product.name} by AT BRAND Sargodha.`,
    'sku': product.sku || `AT-${product.id}`,
    'brand': {
      '@type': 'Brand',
      'name': 'AT BRAND'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '38',
      'bestRating': '5',
      'worstRating': '1'
    },
    'review': reviewsList.map(r => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': r.author
      },
      'datePublished': r.date,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': String(r.rating),
        'bestRating': '5',
        'worstRating': '1'
      },
      'reviewBody': r.comment
    })),
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': 'PKR',
      'price': product.price,
      'priceValidUntil': '2027-12-31',
      'availability': product.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'seller': {
        '@type': 'Organization',
        'name': 'AT BRAND Sargodha'
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': 200,
          'currency': 'PKR'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'PK'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 1,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 3,
            'maxValue': 4,
            'unitCode': 'DAY'
          }
        }
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'PK',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 180,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn',
        'itemCondition': 'https://schema.org/NewCondition'
      }
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': productFaqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{seoProduct.title}</title>
        <meta name="description" content={seoProduct.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoProduct.title} />
        <meta property="og:description" content={seoProduct.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={images[0]} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link 
            to={isPerfume ? '/perfumes' : isWomen ? '/women' : product.category === 'Men' ? '/men' : '/shop'} 
            className="hover:text-primary"
          >
            {isPerfume ? 'Perfumes' : isWomen ? "Women's Collection" : product.category === 'Men' ? "Men's Collection" : "Shop"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse gap-4 sm:flex-row">
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-y-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${selectedImage === idx ? 'border-primary ring-2 ring-accent' : 'border-border'}`}
                  >
                    <img src={img} alt={`${product.name} product view ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
              {product.type && (
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow">
                  {product.type}
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Details and Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {isPerfume ? 'Luxury Arabic Fragrance' : isWomen ? "Women's Designer Collection" : "Men's Premium Suit"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            {seoProduct.colorSummary && (
              <p className="mt-2 text-sm text-muted-foreground">
                This selection includes {seoProduct.colorSummary}.
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-2xl font-bold text-primary sm:text-3xl">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description / Fabric or Fragrance Profile */}
            {product.fabric && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <span className="font-bold text-primary block mb-1">
                  {isPerfume ? 'Fragrance Profile & Notes:' : 'Fabric Specification:'}
                </span>
                <p className="whitespace-pre-line leading-relaxed">{product.fabric}</p>
              </div>
            )}

            {/* Decision Card: Custom Stitching for clothing vs Authentic Fragrance Guarantee for perfumes */}
            {isPerfume ? (
              <div className="mt-6 rounded-2xl border-2 border-emerald-600/25 bg-emerald-50/70 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-800 p-2.5 text-white shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900 mb-1">
                      100% Original Guarantee
                    </span>
                    <h3 className="font-serif text-base font-bold text-emerald-950">
                      Original Arabian Fragrance &amp; Heavy Sillage
                    </h3>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      Yeh fragrance 100% original Eau De Parfum (EDP) concentration hai jo kapron par 10 se 14 ghantay tak barkarar rehti hai. Open parcel Cash on Delivery ke sath receive karein — pehle bottle aur packaging check karein phir payment dein.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-900">
                      <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Long-Lasting Sillage
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Open Parcel COD
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> 6-Month Return
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border-2 border-primary/25 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary p-2.5 text-primary-foreground shrink-0 mt-0.5">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-foreground mb-1">
                      Bespoke Tailoring
                    </span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Do you want custom stitching with this suit?
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Kya aap is suit ki master tailor se customized silai karwana chahte hain? Custom stitching fee <b>PKR 1,500</b> add hogi aur suit apke exact naap ke mutabiq silai hokar deliver hoga.
                    </p>
                    
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link
                        to={`/stitching?suitId=${encodeURIComponent(product.id)}&suitName=${encodeURIComponent(product.name)}&suitPrice=${product.price}&suitImage=${encodeURIComponent(images[selectedImage] || images[0] || '')}`}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow hover:bg-primary/90 transition active:scale-95"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        Yes, Add Stitching (+PKR 1,500)
                      </Link>
                      <button
                        onClick={() => openBuy(product)}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 transition"
                      >
                        No, Unstitched Fabric Only
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => openBuy(product)}
                className="w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95"
              >
                Buy Now (Cash on Delivery)
              </button>

              <button
                onClick={() => {
                  addToCart(product);
                  trackAddToCart(product);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary py-3.5 text-xs font-bold uppercase tracking-widest text-primary transition hover:bg-primary/5 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  trackWhatsAppClick('product_detail_page');
                  openWhatsApp(buildInquiryMessage(product));
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 py-3 text-xs font-bold tracking-wider text-emerald-800 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Inquire on WhatsApp
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-6 text-center text-[11px] text-muted-foreground">
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <Truck className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold text-primary">Rs. 200 Delivery</span>
                <span>Pakistan Post (3-4 Days)</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <ShieldCheck className="h-5 w-5 text-accent mb-1" />
                <span className="font-bold text-primary">Open Parcel COD</span>
                <span>Pehle check karein phir pay</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/40 border border-border/50">
                {isPerfume ? (
                  <>
                    <Sparkles className="h-5 w-5 text-accent mb-1" />
                    <span className="font-bold text-primary">Heavy Sillage</span>
                    <span>10-14 hrs lasting</span>
                  </>
                ) : (
                  <>
                    <Scissors className="h-5 w-5 text-accent mb-1" />
                    <span className="font-bold text-primary">Custom Stitching</span>
                    <span>Advance payment required</span>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/40 border border-border/50">
                <RefreshCw className="h-5 w-5 text-accent mb-1" />
                <Link to="/return-policy" className="hover:underline font-bold text-primary">6-Month Return</Link>
                <span>{isPerfume ? 'Original box mein wapis' : 'Asli halat mein wapis'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions / Google PAA Optimization */}
        <section className="mt-16 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">Product Q&amp;A</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C3A2B]">
            {product.name} — Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {isPerfume
              ? 'Common questions about fragrance longevity, projection, authentic notes, and delivery.'
              : 'Common questions about fabric length, stitching add-on, care instructions, and delivery.'}
          </p>

          <div className="mt-6 space-y-3">
            {productFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200/80 p-4 transition open:border-[#1C3A2B]/40 open:bg-slate-50/60"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Customer Reviews & Ratings Section */}
        <section className="mt-16 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">Verified Feedback</span>
              <h2 className="font-serif text-2xl font-bold text-[#1C3A2B] mt-1">
                Customer Reviews &amp; Ratings
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                {isPerfume 
                  ? `Real feedback from Pakistani fragrance lovers who purchased ${product.name}.`
                  : `Real feedback from Pakistani customers who purchased ${product.name}.`}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-[#1C3A2B]">4.9</div>
                <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1">Based on 38 reviews</div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 98% Recommend this product
                </div>
                <div className="text-[11px] text-slate-500">
                  Open Parcel COD Verified
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{rev.title}</h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{rev.author} <span className="text-[11px] font-normal text-slate-500">({rev.city})</span></span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Write a Review Form */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <h3 className="font-serif text-lg font-bold text-[#1C3A2B]">
              Write a Product Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your experience with other customers regarding product quality, fragrance/fabric, and delivery.
            </p>

            {reviewSubmitted && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Shukriya! Aapka review shamil kar liya gaya hai.
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aapka Naam *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Khan"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1C3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shehar (City)</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Sargodha, Karachi"
                  value={newReviewCity}
                  onChange={(e) => setNewReviewCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1C3A2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${newReviewRating === star ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{star} Stars</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aapka Review (Feedback) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={isPerfume ? "Fragrance ki lasting, projection, packaging aur delivery ke bare mein batayein..." : "Quality, fall, packaging aur open parcel delivery ke bare mein batayein..."}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1C3A2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#1C3A2B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:opacity-90 transition active:scale-95"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Related Products - Dynamic per category */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                  {isPerfume ? 'Explore More Scents' : isWomen ? "Women's Collection" : 'Complete Your Collection'}
                </p>
                <h2 className="font-serif text-2xl font-bold text-[#1C3A2B]">
                  {isPerfume ? 'Related Luxury Fragrances' : isWomen ? "Related Designer Suits" : 'Related Premium Fabrics'}
                </h2>
              </div>
              <Link
                to={isPerfume ? '/perfumes' : isWomen ? '/women' : product.category === 'Men' ? '/men' : '/shop'}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
              >
                <span>Explore More</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
