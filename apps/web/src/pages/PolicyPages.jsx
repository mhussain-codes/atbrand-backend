import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Truck, RefreshCw, PhoneCall } from 'lucide-react';
import { WHATSAPP_NUMBER_DISPLAY, SUPPORT_EMAIL } from '@/lib/whatsapp';

export function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      description="Nationwide delivery across Pakistan via Leopard, TCS, and Trax. Delivery timelines, cash on delivery, and shipping rates."
    >
      <h2 className="text-xl font-bold text-primary mb-3">1. Nationwide Delivery</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AT BRAND delivers unstitched fabric suits and accessories to all cities, towns, and postal sectors across Pakistan. Deliveries are dispatched from our central store in Sargodha.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">2. Delivery Timeframes</h2>
      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2 mb-6">
        <li><b>Punjab Major Cities:</b> 2 to 3 business days.</li>
        <li><b>Sindh, KPK, Balochistan & Outlying Areas:</b> 3 to 5 business days.</li>
        <li><b>Custom Stitched Orders:</b> Require an additional 4 to 6 business days for fabric cutting, pattern drafting, and master stitching.</li>
      </ul>

      <h2 className="text-xl font-bold text-primary mb-3">3. Cash on Delivery (COD)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We offer secure Cash on Delivery (COD) for all orders. You pay the delivery rider only when the parcel reaches your doorstep. Please ensure your contact number remains reachable for delivery confirmation.
      </p>
    </PolicyLayout>
  );
}

export function ReturnPolicyPage() {
  return (
    <PolicyLayout
      title="Return & Exchange Policy"
      description="Easy 7-day return and exchange policy for unstitched suits. Guaranteed fabric quality."
    >
      <h2 className="text-xl font-bold text-primary mb-3">1. 7-Day Hassle-Free Returns</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We take great pride in our fabric standards. If your unstitched suit has any manufacturing defect, color discrepancy, or damage in transit, you can request an exchange or refund within 7 days of delivery.
      </p>

      <h2 className="text-xl font-bold text-primary mb-3">2. Conditions for Return</h2>
      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2 mb-6">
        <li>Fabric must remain <b>uncut, unwashed, and unstitched</b> with all original brand tags, ribbon ties, and box intact.</li>
        <li>Custom stitched items tailored to custom customer measurements cannot be returned unless a stitching defect is verified by our master tailor.</li>
      </ul>

      <h2 className="text-xl font-bold text-primary mb-3">3. How to Initiate a Return</h2>
      <p className="text-sm text-muted-foreground">
        Simply WhatsApp our customer care desk at <b>{WHATSAPP_NUMBER_DISPLAY}</b> with your order number and brief photos of the fabric. Our team will arrange reverse pickup or exchange dispatch immediately.
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
