import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Truck, RefreshCw, PhoneCall, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_NUMBER_DISPLAY, SUPPORT_EMAIL } from '@/lib/whatsapp';

export function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      description="Flat PKR 200 delivery nationwide across Pakistan via Pakistan Post. Delivery in 3 to 4 working days with Open Parcel Cash on Delivery."
    >
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 mb-6">
        <p className="text-sm font-semibold text-emerald-900">
          ✓ Flat Delivery Charges: <strong>PKR 200</strong> across Pakistan | Delivery Time: <strong>3 to 4 Working Days</strong> via Pakistan Post.
        </p>
      </div>

      <h2 className="text-xl font-bold text-primary mb-3">1. Nationwide Delivery via Pakistan Post</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AT BRAND delivers unstitched menswear fabrics and accessories across all cities, tehsils, and postal sectors in Pakistan. We use <strong>Pakistan Post (Post Office)</strong> and trusted express parcel networks to ensure safe, traceable parcel delivery.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">2. Delivery Charges</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We charge a transparent flat rate of <strong>PKR 200</strong> per delivery anywhere in Pakistan, regardless of order weight or destination city.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">3. Delivery Timeframe (3 to 4 Working Days)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Standard delivery takes <strong>3 to 4 working days</strong> nationwide. Humari poori koshish hoti hai ke parcel jitni jaldi mumkin ho aap tak deliver kiya jaye. Custom stitched suit orders require an additional 4 to 6 business days for master tailoring.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">4. Cash on Delivery (COD) &amp; Open Parcel Inspection</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cash on Delivery is available on all unstitched suit orders with an <strong>Open Parcel</strong> option: aap courier rider ke samne parcel khol kar fabric aur color check kar saktay hain, phir payment karein.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">5. Custom Stitching Payment Policy</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cash on Delivery sirf unstitched suit par available hai. Agar aap custom silai (master tailoring) karwana chahte hain, toh <strong>Advance Payment (JazzCash / EasyPaisa / Bank Transfer)</strong> lazmi hogi kyunke kapra aapke makhsoos body measurements ke mutabiq kaata jata hai.
      </p>
    </PolicyLayout>
  );
}

export function ReturnPolicyPage() {
  return (
    <PolicyLayout
      title="Return & Exchange Policy"
      description="6-Month unconditional return policy: Return tab hogi jab cheez apni asli halat mein ho — beshak 6 maheene baad wapis karein, koi issue nahi."
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
        <h3 className="font-serif text-base font-bold text-primary mb-1">
          Asli Halat Guarantee — Beshak 6 Maheene Baad Wapis Karein
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Hamara asool seedha aur saaf hai: <strong>Return tab hogi jab cheez apni asli halat mein ho — beshak 6 maheene baad wapis kar dein, koi issue nahi hai!</strong>
        </p>
      </div>

      <h2 className="text-xl font-bold text-primary mb-3">1. Return Window: Up to 6 Months (180 Days)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Aap suit receive karne ke 6 maheene baad bhi return ya exchange karwa saktay hain agar aapka irada badal gaya ho ya koi bhi masla ho.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">2. Return Ki Shart (Condition)</h2>
      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2 mb-6">
        <li>Kapra <strong>uncut, unwashed aur unstitched</strong> hona lazmi hai (yani kapra kaata ya dhoya na gaya ho).</li>
        <li>Original brand tags, ribbon ties aur packing box mehfooz honi chahiye.</li>
        <li>Custom stitched garments (jo customer ke naap par sil chuke hon) par return laagu nahi hoti, siwaye kisi verified tailoring mistake ke.</li>
      </ul>

      <h2 className="text-xl font-bold text-primary mb-3">3. Return / Exchange Ka Asaan Tariqa</h2>
      <p className="text-sm text-muted-foreground">
        Bas hamare WhatsApp number <strong>{WHATSAPP_NUMBER_DISPLAY}</strong> par apna Order ID aur fabric ki tasweer bheinjiye. Humari team aapka return ya exchange foran process karegi.
      </p>
    </PolicyLayout>
  );
}

export function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description="How AT BRAND protects your personal information and respects customer confidentiality."
    >
      <p className="text-sm text-muted-foreground mb-4">
        At AT BRAND Sargodha, we respect your confidentiality. We collect only essential contact and delivery information (name, mobile phone number, delivery address, city) solely to process, deliver, and verify your orders.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        We do not sell, rent, or trade your personal information with third-party advertising networks. Delivery information is shared strictly with authorized courier partners to execute final parcel dispatch.
      </p>
    </PolicyLayout>
  );
}

export function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      description="AT BRAND terms of service, ordering procedures, and store policies."
    >
      <p className="text-sm text-muted-foreground mb-4">
        By accessing and placing an order with AT BRAND Sargodha, you agree to these terms. Prices are listed in Pakistani Rupees (PKR) and include packaging.
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Every effort is made to accurately portray fabric colors in high-definition natural lighting; slight shade differences can occasionally occur depending on user smartphone display calibrations.
      </p>
    </PolicyLayout>
  );
}

function PolicyLayout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title} | AT BRAND Sargodha</title>
        <meta name="description" content={description} />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl mb-8 border-b border-border pb-4">
          {title}
        </h1>
        <div className="prose max-w-none text-foreground">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
