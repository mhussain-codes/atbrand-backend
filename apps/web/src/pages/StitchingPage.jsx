import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GarmentPreview2D from '@/components/GarmentPreview2D';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Scissors, CheckCircle, Ruler } from 'lucide-react';
import { openWhatsApp, buildOrderMessage } from '@/lib/whatsapp';

export default function StitchingPage() {
  const [unit, setUnit] = useState('inches'); // 'inches' or 'cm'
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
          special_instructions: measurements.specialInstructions
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedData(data);
        toast.success(`Stitching order ${data.request_number} recorded successfully!`);

        // Build WhatsApp notification message
        const waText = [
          '*NEW CUSTOM STITCHING REQUEST — AT BRAND*',
          '------------------------------',
          `*Request ID:* ${data.request_number}`,
          `*Name:* ${contact.name}`,
          `*Phone:* ${contact.phone}`,
          `*City:* ${contact.city}`,
          '------------------------------',
          `*Style:* Collar: ${styles.collar}, Sleeves: ${styles.sleeves}, Daman: ${styles.daman}`,
          `*Measurements (${unit}):*`,
          `• Kurta Length: ${measurements.kurtaLength}`,
          `• Chest: ${measurements.chest}`,
          `• Shoulder (Teera): ${measurements.shoulder}`,
          `• Sleeves: ${measurements.sleeveLength}`,
          `• Shalwar Length: ${measurements.shalwarLength}`,
          `• Bottom Opening (Paincha): ${measurements.shalwarBottom}`,
          '------------------------------',
          'Please confirm fabric cutting and stitching schedule. Shukriya!'
        ].join('\n');

        openWhatsApp(waText);
      } else {
        toast.error('Failed to submit stitching order. Please try again.');
      }
    } catch (err) {
      toast.error('Network connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Master Custom Tailoring & Stitching | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Premium bespoke men's kurta shalwar stitching in Sargodha, Pakistan. Exact custom measurements, collar options, cuff styles, and flawless fitting."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Bespoke Master Tailoring</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Custom Stitching Service
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Flawless cuts and traditional Pakistani craftsmanship for your unstitched suits. Customized to your exact fit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left: 2D Interactive Preview & Style Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <GarmentPreview2D
              collar={styles.collar}
              neckline={styles.neckline}
              sleeves={styles.sleeves}
              daman={styles.daman}
              buttons={styles.buttons}
              color={styles.color}
            />

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-primary mb-4">Design Customization</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Collar / Ban</label>
                  <select
                    value={styles.collar}
                    onChange={(e) => handleStyleChange('collar', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="sherwani">Sherwani Collar</option>
                    <option value="mandarin">Mandarin (Round Ban)</option>
                    <option value="shirt">Shirt Collar</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Sleeves & Cuffs</label>
                  <select
                    value={styles.sleeves}
                    onChange={(e) => handleStyleChange('sleeves', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="cuff">French Cuffs with Button</option>
                    <option value="straight">Open Straight Sleeves</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Daman (Ghera)</label>
                  <select
                    value={styles.daman}
                    onChange={(e) => handleStyleChange('daman', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="round">Round Daman (Gol)</option>
                    <option value="straight">Square Daman (Chakor)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Buttons Style</label>
                  <select
                    value={styles.buttons}
                    onChange={(e) => handleStyleChange('buttons', e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2"
                  >
                    <option value="metal">Antique Brass Metal</option>
                    <option value="fabric">Fabric Wrapped (Same Color)</option>
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
                  <h2 className="font-serif text-xl font-bold text-primary">Measurements Form</h2>
                </div>

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

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">1. Contact & Delivery</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Full Name *</label>
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
                    <label className="text-xs font-semibold block mb-1">Phone / WhatsApp *</label>
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
                    <label className="text-xs font-semibold block mb-1">Delivery Address *</label>
                    <input
                      required
                      type="text"
                      placeholder="House, Street, Sector / Area"
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
                  2. Tailoring Specifications ({unit})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Kurta Length (Lambai)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.kurtaLength}
                      onChange={(e) => handleMeasurementChange('kurtaLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Chest (Chhati)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Shoulder (Teera)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shoulder}
                      onChange={(e) => handleMeasurementChange('shoulder', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Sleeves (Bazu)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.sleeveLength}
                      onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Collar Size (Gala)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.neck}
                      onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Daman Width (Ghera)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.damanWidth}
                      onChange={(e) => handleMeasurementChange('damanWidth', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Shalwar Length</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shalwarLength}
                      onChange={(e) => handleMeasurementChange('shalwarLength', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Bottom (Paincha)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={measurements.shalwarBottom}
                      onChange={(e) => handleMeasurementChange('shalwarBottom', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Fitting Preference</label>
                    <select
                      value={measurements.fittingPreference}
                      onChange={(e) => handleMeasurementChange('fittingPreference', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                    >
                      <option value="Regular Fit">Regular Fit</option>
                      <option value="Slim Fit">Smart / Slim Fit</option>
                      <option value="Comfort / Loose">Loose Traditional</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold block mb-1">Special Instructions / Tailoring Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Single pocket on chest, double stitch on sides, soft collar padding..."
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
                  className="w-full rounded-xl bg-primary py-3.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Stitching Request...' : 'Submit & Confirm on WhatsApp'}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Our master tailor will review your measurements before cutting. Cash on delivery accepted.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
