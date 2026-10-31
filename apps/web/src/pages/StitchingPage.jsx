import React, { useState, Suspense, lazy } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GarmentPreview2D from '@/components/GarmentPreview2D';
const GarmentPreview3D = lazy(() => import('@/components/GarmentPreview3D'));
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Scissors, CheckCircle, Ruler, ShoppingBag, X, Sparkles, ChevronDown, HelpCircle, Layers } from 'lucide-react';
import { openWhatsApp, formatPKR } from '@/lib/whatsapp';

export default function StitchingPage() {
  const [searchParams] = useSearchParams();
  const suitId = searchParams.get('suitId');
  const suitName = searchParams.get('suitName');
  const suitPrice = Number(searchParams.get('suitPrice')) || 0;
  const suitImage = searchParams.get('suitImage');

  const stitchingFee = 1500;
  const deliveryFee = 200;
  const totalCombinedPrice = (suitId ? suitPrice : 0) + stitchingFee + deliveryFee;

  const [unit, setUnit] = useState('inches'); // 'inches' or 'cm'
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Style selections for 2D visualizer
  const [styles, setStyles] = useState({
    collar: 'sherwani',
    neckline: 'placket',
    sleeves: 'cuff',
    daman: 'round',
    buttons: 'metal',
    color: '#1C3A2B'
  });

  // Customer contact info
  const [contact, setContact] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: 'Sargodha'
  });

  // Comprehensive Pakistani tailoring measurements
  const [measurements, setMeasurements] = useState({
    kurtaLength: '40',
    chest: '42',
    waist: '38',
    hip: '42',
    shoulder: '18',
    sleeveLength: '24',
    bazuWidth: '8.5',
    neck: '15.5',
    armhole: '9.5',
    damanWidth: '23',
    shalwarLength: '39',
    shalwarWaist: '36',
    shalwarBottom: '8.5',
    fittingPreference: 'Regular Fit',
    specialInstructions: ''
  });

  const handleStyleChange = (field, val) => {
    setStyles(prev => ({ ...prev, [field]: val }));
  };

  const handleMeasurementChange = (field, val) => {
    setMeasurements(prev => ({ ...prev, [field]: val }));
  };

  const handleContactChange = (field, val) => {
    setContact(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.name || !contact.phone || !contact.address) {
      toast.error('Please fill in your name, phone, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit stitching request
      const res = await fetch('/api/stitching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: contact.name,
          phone: contact.phone,
          whatsapp: contact.whatsapp || contact.phone,
          address: contact.address,
          city: contact.city,
          unit,
          style_selections: styles,
          measurements,
          fabric_choice: suitName ? `${suitName} (PKR ${suitPrice})` : 'Customer Own Fabric',
          special_instructions: measurements.specialInstructions,
          stitching_price: stitchingFee,
          total_amount: totalCombinedPrice
        })
      });

      const data = await res.json();
      
      // 2. Also register order in orders database if bundled with a suit
      if (suitId) {
        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: contact.name,
              phone: contact.phone,
              address: contact.address,
              city: contact.city,
              items: [
                {
                  id: suitId,
                  name: `${suitName} + Custom Stitching`,
                  price: totalCombinedPrice,
                  quantity: 1,
                  type: 'Suit + Stitching'
                }
              ],
              subtotal: totalCombinedPrice,
              delivery_charge: deliveryFee,
              total_amount: totalCombinedPrice,
              payment_method: 'Advance Payment',
              customer_notes: `Bespoke Tailoring Request: ${data.request_number || 'ST'}. Style: ${styles.collar}, ${styles.sleeves}`
            })
          });
        } catch (err) {
          console.error("Order sync error", err);
        }
      }

      if (res.ok && data.success) {
        setSubmittedData(data);
        toast.success(`Stitching order ${data.request_number} recorded successfully!`);

        // Build WhatsApp notification message
        const waLines = [
          suitId ? '*COMBINED SUIT & CUSTOM STITCHING ORDER — AT BRAND*' : '*CUSTOM STITCHING REQUEST — AT BRAND*',
          '==============================',
          `*Order / Request ID:* ${data.request_number}`,
          suitId ? `*Selected Suit:* ${suitName} (${formatPKR(suitPrice)})` : null,
          `*Stitching Fee:* ${formatPKR(stitchingFee)}`,
          `*Delivery (Pakistan Post):* ${formatPKR(deliveryFee)}`,
          `*TOTAL AMOUNT:* ${formatPKR(totalCombinedPrice)}`,
          `*Payment Note:* Stitching ke liye Advance Payment lazmi hai. Unstitched suit par COD available hai.`,
          '==============================',
          `*Customer:* ${contact.name}`,
          `*Phone:* ${contact.phone}`,
          `*Delivery Address:* ${contact.address}, ${contact.city}`,
          '==============================',
          `*Style Selections:*`,
          `• Ban / Collar: ${styles.collar}`,
          `• Sleeves: ${styles.sleeves}`,
          `• Daman: ${styles.daman}`,
          `• Buttons: ${styles.buttons}`,
          `• Fitting: ${measurements.fittingPreference}`,
          '------------------------------',
          `*Measurements (${unit}):*`,
          `• Kurta Length: ${measurements.kurtaLength}`,
          `• Chest: ${measurements.chest}`,
          `• Shoulder (Teera): ${measurements.shoulder}`,
          `• Sleeves: ${measurements.sleeveLength}`,
          `• Bazu Mori: ${measurements.bazuWidth}`,
          `• Neck (Gala): ${measurements.neck}`,
          `• Armhole (Monda): ${measurements.armhole}`,
          `• Daman: ${measurements.damanWidth}`,
          `• Shalwar Length: ${measurements.shalwarLength}`,
          `• Paincha: ${measurements.shalwarBottom}`,
          measurements.specialInstructions ? `• Note: ${measurements.specialInstructions}` : null,
          '==============================',
          'Please confirm cutting and stitching schedule. Shukriya!'
        ].filter(Boolean).join('\n');

        openWhatsApp(waLines);
      } else {
        toast.error('Failed to submit stitching order. Please try again.');
      }
    } catch (err) {
      toast.error('Network connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stitchingBreadcrumbSchema = {
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
        'name': 'Bespoke Custom Stitching',
        'item': 'https://atbrand.store/stitching'
      }
    ]
  };

  const stitchingServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': "Bespoke Men's Kurta Shalwar Tailoring Service",
    'serviceType': 'Custom Tailoring & Stitching',
    'provider': {
      '@type': 'ClothingStore',
      'name': 'AT BRAND Sargodha',
      'url': 'https://atbrand.store/'
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'Pakistan'
    },
    'offers': {
      '@type': 'Offer',
      'price': '1500',
      'priceCurrency': 'PKR',
      'availability': 'https://schema.org/InStock'
    },
    'description': "Precision Pakistani master tailoring for men's unstitched suits. Sherwani ban, shirt collars, French cuffs, round and square daman with nationwide cash on delivery."
  };

  const stitchingFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does online custom suit stitching work at AT BRAND?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "You enter your personal measurements (length, chest, shoulder, bazu, ghera, and shalwar), select your ban, sleeve, and daman preferences, and our master tailors in Sargodha cut and stitch your suit with precision before dispatching via Cash on Delivery."
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the stitching fee for men\'s unstitched suits?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "AT BRAND charges a transparent flat fee of PKR 1,500 for master tailoring, including premium bukram interlining, stitching thread, and button accessories."
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I send my own fabric or bundle stitching with an unstitched suit?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes! You can bundle custom stitching with any unstitched suit from our collection, or place a custom stitching request for your own fabric."
        }
      },
      {
        '@type': 'Question',
        'name': 'How long does delivery take for custom stitched suits in Pakistan?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Custom tailoring takes 4 to 6 business days for master cutting and finishing, followed by 2 to 3 days courier transit to any city in Pakistan with Cash on Delivery."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Master Custom Tailoring & Men's Kurta Shalwar Stitching in Pakistan | AT BRAND</title>
        <meta
          name="description"
          content="Order custom tailored men's kurta shalwar with 3D interactive fit preview. Sherwani ban, collar designs, cuff options, and master tailoring by AT BRAND Sargodha with Cash on Delivery."
        />
        <link rel="canonical" href="https://atbrand.store/stitching" />
        <meta property="og:title" content="3D Custom Kurta Shalwar Stitching | AT BRAND Sargodha" />
        <meta property="og:description" content="Precision Pakistani tailoring for unstitched suits with interactive 3D silhouette preview. Cash on Delivery nationwide." />
        <script type="application/ld+json">
          {JSON.stringify(stitchingBreadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(stitchingServiceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(stitchingFaqSchema)}
        </script>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A880]">Custom Suit Silai (Tailoring)</p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Apne Naap Ke Mutabiq Suit Silwayein
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-muted-foreground font-medium">
            Sargodha ke experienced master darzi se perfect fit kurta shalwar silwayein. Apna naap likhein, 3D mein design check karein, aur nationwide Cash on Delivery par hasil karein.
          </p>
        </div>

        {/* Attached Suit Bundle Banner (If navigating from a product page) */}
        {suitId && (
          <div className="mb-10 rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {suitImage ? (
                  <img
                    src={suitImage}
                    alt={suitName}
                    className="h-20 w-16 rounded-xl object-cover border border-primary/20 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Scissors className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground mb-1">
                    <CheckCircle className="h-3 w-3" />
                    Bundled Suit Selected
                  </div>
                  <h3 className="font-serif text-lg font-bold text-primary sm:text-xl">
                    {suitName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <span>Suit: <b className="text-primary">{formatPKR(suitPrice)}</b></span>
                    <span>•</span>
                    <span>Stitching: <b className="text-primary">{formatPKR(stitchingFee)}</b></span>
                    <span>•</span>
                    <span>Delivery: <b className="text-primary">{formatPKR(deliveryFee)}</b></span>
                    <span>•</span>
                    <span className="text-sm font-extrabold text-primary bg-accent/20 px-2 py-0.5 rounded-md">
                      Total: {formatPKR(totalCombinedPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/product/${suitId}`}
                  className="rounded-full border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition"
                >
                  Change Suit
                </Link>
                <Link
                  to="/stitching"
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  title="Remove suit and order stitching only"
                >
                  Remove Suit
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left: 3D/2D Interactive Preview & Style Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 rounded-full bg-muted p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode('2d')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === '2d'
                      ? 'bg-[#1C3A2B] text-white shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Asli Suit Design</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === '3d'
                      ? 'bg-[#1C3A2B] text-white shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>3D Model (360°)</span>
                </button>
              </div>
            </div>

            {viewMode === '3d' ? (
              <Suspense fallback={
                <GarmentPreview2D
                  collar={styles.collar}
                  neckline={styles.neckline}
                  sleeves={styles.sleeves}
                  daman={styles.daman}
                  buttons={styles.buttons}
                  color={styles.color}
                />
              }>
                <GarmentPreview3D
                  collar={styles.collar}
                  neckline={styles.neckline}
                  sleeves={styles.sleeves}
                  daman={styles.daman}
                  buttons={styles.buttons}
                  color={styles.color}
                  measurements={measurements}
                  unit={unit}
                  onColorChange={(newCol) => handleStyleChange('color', newCol)}
                />
              </Suspense>
            ) : (
              <GarmentPreview2D
                collar={styles.collar}
                neckline={styles.neckline}
                sleeves={styles.sleeves}
                daman={styles.daman}
                buttons={styles.buttons}
                color={styles.color}
              />
            )}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-primary mb-3">Suit Ka Style Pasand Karein</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Collar / Ban Style</label>
                  <select
                    value={styles.collar}
                    onChange={(e) => handleStyleChange('collar', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="sherwani">Sherwani Ban (Khara Ban)</option>
                    <option value="mandarin">Gool Ban (Soft Mandarin)</option>
                    <option value="shirt">Shirt Collar (Fold Collar)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Bazu &amp; Cuffs Style</label>
                  <select
                    value={styles.sleeves}
                    onChange={(e) => handleStyleChange('sleeves', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="cuff">Cuff with Button (Kaf Bazu)</option>
                    <option value="straight">Seedha Bazu (Open Straight)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Daman (Ghera) Cut</label>
                  <select
                    value={styles.daman}
                    onChange={(e) => handleStyleChange('daman', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="round">Gool Daman (Round Cut)</option>
                    <option value="straight">Chakor Daman (Straight Cut)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Buttons Style</label>
                  <select
                    value={styles.buttons}
                    onChange={(e) => handleStyleChange('buttons', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="metal">Golden Metal Buttons</option>
                    <option value="fabric">Matching Fabric Buttons</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="font-semibold block mb-1 text-xs">Fabric Color Preview</label>
                <div className="flex gap-2">
                  {[
                    { name: 'Dark Green', hex: '#1C3A2B' },
                    { name: 'Pure White', hex: '#FFFFFF' },
                    { name: 'Off White', hex: '#F0ECE1' },
                    { name: 'Slate Blue', hex: '#4B6B82' },
                    { name: 'Camel Brown', hex: '#8B5A2B' },
                    { name: 'Charcoal', hex: '#2C3539' }
                  ].map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleStyleChange('color', c.hex)}
                      className={`h-7 w-7 rounded-full border-2 transition ${styles.color === c.hex ? 'border-primary ring-2 ring-accent' : 'border-border'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Measurements & Order Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-accent" />
                  <h2 className="font-serif text-lg font-bold text-primary">Apna Naap Likhein (Measurements)</h2>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/size-guide"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 transition"
                    title="View Size Guide"
                  >
                    <Ruler className="h-3.5 w-3.5 text-accent" />
                    <span>Size Guide</span>
                  </Link>

                  {/* Unit Switcher */}
                  <div className="flex items-center rounded-lg border border-input bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setUnit('inches')}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${unit === 'inches' ? 'bg-background shadow text-primary' : 'text-muted-foreground'}`}
                    >
                      Inches
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('cm')}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${unit === 'cm' ? 'bg-background shadow text-primary' : 'text-muted-foreground'}`}
                    >
                      Centimeters
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">1. Delivery Info (Naam aur Pata)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Poora Naam (Full Name) *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Muhammad Ali"
                      value={contact.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">WhatsApp / Phone Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="0300 1234567"
                      value={contact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold block mb-1">Ghar Ka Pata (Delivery Address) *</label>
                    <input
                      required
                      type="text"
                      placeholder="Makaan no, Gali, Mohalla / Sector, Shehr"
                      value={contact.address}
                      onChange={(e) => handleContactChange('address', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Measurements Inputs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  2. Kameez Shalwar Ka Naap ({unit})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Kameez Lambai (Length)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.kurtaLength}
                      onChange={(e) => handleMeasurementChange('kurtaLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Chhati (Chest)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Teera (Shoulder)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shoulder}
                      onChange={(e) => handleMeasurementChange('shoulder', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Bazu (Sleeves)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.sleeveLength}
                      onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Gala / Collar Size</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.neck}
                      onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Ghera / Daman</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.damanWidth}
                      onChange={(e) => handleMeasurementChange('damanWidth', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Shalwar Lambai</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shalwarLength}
                      onChange={(e) => handleMeasurementChange('shalwarLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Paincha (Bottom)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shalwarBottom}
                      onChange={(e) => handleMeasurementChange('shalwarBottom', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Fitting Style</label>
                    <select
                      value={measurements.fittingPreference}
                      onChange={(e) => handleMeasurementChange('fittingPreference', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    >
                      <option value="Regular Fit">Normal / Regular Fit</option>
                      <option value="Slim Fit">Smart / Slim Fit</option>
                      <option value="Comfort / Loose">Khula (Loose Fit)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold block mb-1">Koi Khas Hidayat (Special Tailoring Notes)</label>
                  <textarea
                    rows={2}
                    placeholder="Maslan: Single front pocket, side pocket mein zip, soft bukram..."
                    value={measurements.specialInstructions}
                    onChange={(e) => handleMeasurementChange('specialInstructions', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-primary py-4 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Order Save Ho Raha Hai...'
                    : suitId
                    ? `Suit + Silai Order Confirm Karein (${formatPKR(totalCombinedPrice)})`
                    : `Silai Ka Order Dein (${formatPKR(stitchingFee)})`}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Kapra kaatne se pehle hamare master tailor aapke diye gaye naap ko check karenge. Custom silai ke liye Advance Payment (JazzCash / EasyPaisa / Bank Transfer) zaroori hai. Pakistan Post ke zariye 3-4 working days mein delivery.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* SEO Tailoring Guide & Internal Linking Section */}
        <section className="mt-16 border-t border-border/60 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">Pakistani Bespoke Craft</span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C3A2B]">
                How Our Sargodha Master Tailoring Works
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every stitch at AT BRAND represents authentic Pakistani bespoke tradition. When you order custom stitching, our master ustad personally reviews your submitted dimensions (kameez length, chest, waist, shoulder, ghera, and paincha) to ensure perfect collar fall and zero fabric wrinkling. We use premium interlining (bukram) that maintains crispness even after repeated washing.
              </p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Pair With Our Unstitched Fabrics:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Link to="/men/ahmad-cotton" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Ahmad Cotton</Link>
                  <Link to="/men/rashid-cotton" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Rashid Cotton</Link>
                  <Link to="/men/wash-and-wear" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Wash & Wear</Link>
                  <Link to="/men/boski" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Pure Boski</Link>
                  <Link to="/men/khaddar" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Winter Khaddar</Link>
                  <Link to="/men/lattha" className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-primary hover:border-primary transition">Egyptian Lattha</Link>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">Frequently Asked Questions</span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C3A2B]">
                Suit Silai Ke Ahem Sawalat (Tailoring FAQs)
              </h2>

              <div className="mt-5 space-y-3">
                <details className="group rounded-2xl border border-slate-200 p-4 transition open:bg-slate-50/50">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                    <span>How does online custom suit stitching work at AT BRAND?</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    You enter your personal measurements (length, chest, shoulder, bazu, ghera, and shalwar), select your ban, sleeve, and daman preferences, and our master tailors in Sargodha cut and stitch your suit with precision before dispatching via Cash on Delivery.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200 p-4 transition open:bg-slate-50/50">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                    <span>What is the stitching fee for men's unstitched suits?</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    AT BRAND charges a transparent flat fee of PKR 1,500 for master tailoring, including premium bukram interlining, stitching thread, and button accessories.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200 p-4 transition open:bg-slate-50/50">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                    <span>Can I send my own fabric or bundle stitching with an unstitched suit?</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    Yes! You can bundle custom stitching with any unstitched suit from our collection, or place a custom stitching request for your own fabric.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200 p-4 transition open:bg-slate-50/50">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs sm:text-sm text-slate-800">
                    <span>How long does delivery take for custom stitched suits in Pakistan?</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    Custom tailoring takes 4 to 6 business days for master cutting and finishing, followed by 2 to 3 days courier transit to any city in Pakistan with Cash on Delivery.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
