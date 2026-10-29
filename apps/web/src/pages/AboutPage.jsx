import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';
import { Award, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import { STORE_LOCATION } from '@/lib/whatsapp';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>About Us | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Learn about AT BRAND Sargodha. Pakistan's trusted destination for unstitched menswear, premium cottons, and master tailoring."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Heritage & Excellence</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            The Story Behind AT BRAND
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Rooted in Sargodha, Pakistan. Dedicated to timeless unstitched menswear fabrics and precision custom stitching.
          </p>
        </div>

        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-foreground">
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">Our Craft & Philosophy</h2>
            <p className="text-muted-foreground mb-4">
              AT BRAND was established with a singular mission: to supply Pakistani gentlemen with genuine, high-grade unstitched fabrics without compromise. From pure Egyptian-feel cottons and wrinkle-resistant Wash & Wear to authentic Boski and seasonal Khaddar, each fabric roll is individually inspected for thread count, drape, and colorfastness.
            </p>
            <p className="text-muted-foreground">
              Based in New Satellite Town, Sargodha, our physical showroom and digital store welcome patrons seeking traditional shalwar kameez tailored to perfection.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Award className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Authentic Mill Fabrics</h3>
              <p className="text-xs text-muted-foreground">Sourced directly from Pakistan's most revered textile houses including Rashid & Ahmad Cotton.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <ShieldCheck className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Guaranteed Quality</h3>
              <p className="text-xs text-muted-foreground">Full color and burr warranty. If fabric shrinks or fades unexpectedly, we replace it.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <HeartHandshake className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Nationwide COD</h3>
              <p className="text-xs text-muted-foreground">Reliable delivery to your doorstep across all four provinces and territories.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary mb-1">Visit Our Sargodha Flagship</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                <MapPin className="h-4 w-4 text-accent" />
                {STORE_LOCATION}
              </p>
            </div>
            <a
              href="https://wa.me/923106017983"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow hover:opacity-90"
            >
              Contact Our Desk
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
