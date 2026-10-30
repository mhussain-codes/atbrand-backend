import React from 'react';
import { Link } from 'react-router-dom';
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
          content="Learn about AT BRAND, a Sargodha store for men's unstitched suits and custom stitching. Find store contact details and delivery information."
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
              AT BRAND is a Sargodha menswear store offering unstitched shalwar kameez fabrics such as Ahmad Cotton, Rashid Cotton, Wash &amp; Wear, Boski and Khaddar, together with custom stitching. Product pages list the current item's photos, fabric notes and price so shoppers can compare the available selection before ordering.
            </p>
            <p className="text-muted-foreground">
              Based in New Satellite Town, Sargodha, our physical showroom and digital store welcome patrons seeking traditional shalwar kameez tailored to perfection.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Award className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Men’s Fabric Selection</h3>
              <p className="text-xs text-muted-foreground">Browse available Ahmad Cotton, Rashid Cotton, Wash &amp; Wear, Boski and seasonal fabrics.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <ShieldCheck className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Returns for Eligible Issues</h3>
              <p className="text-xs text-muted-foreground">Review the <Link to="/return-policy" className="font-semibold underline underline-offset-2">return and exchange policy</Link> for the 7-day request window and item conditions.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <HeartHandshake className="mx-auto h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold text-primary mb-1">Nationwide COD</h3>
              <p className="text-xs text-muted-foreground">Cash on Delivery is available for orders across Pakistan. Delivery timelines depend on the destination.</p>
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
