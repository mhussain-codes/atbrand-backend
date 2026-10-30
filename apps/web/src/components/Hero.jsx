import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Truck, Banknote, Scissors } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { PRODUCTS } from '@/data/products';
import { formatPKR, openWhatsApp } from '@/lib/whatsapp';

const listedPrices = PRODUCTS.map((product) => Number(product.price)).filter((price) => Number.isFinite(price) && price > 0);
const startingPrice = listedPrices.length > 0 ? Math.min(...listedPrices) : null;

const TRUST = [
  { icon: Banknote, label: 'Cash on Delivery' },
  { icon: Truck, label: 'Nationwide Shipping' },
  { icon: Scissors, label: 'Master Tailoring' },
];

export default function Hero({ image }) {
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 select-none font-display text-[22vw] leading-none text-primary/5"
      >
        AT
      </span>

      <div className="mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div>
          <Reveal>
            {/* SEO Updated Top Label */}
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-10 bg-accent" />
              AT Brand Sargodha · Menswear
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            {/* SEO Updated H1 Heading */}
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
              Men's Unstitched Suits{' '}
              <span className="text-primary">in Sargodha, Pakistan.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            {/* SEO Updated Description */}
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Shop men's unstitched shalwar kameez at AT BRAND Sargodha. Browse Ahmad Cotton, Rashid Cotton, Wash &amp; Wear, Boski and Khaddar, with custom stitching and online ordering.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
              >
                Browse the Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => openWhatsApp('Assalam-o-Alaikum! I would like to place an order.')}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Order on WhatsApp
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {TRUST.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={32}>
          <div className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-b-3xl rounded-t-[12rem] border border-accent/50"
            />
            {/* SEO Updated Image Alt Tag */}
            <img
              src={image}
              alt="Mens premium unstitched suit and shalwar kameez by AT Brand Sargodha"
              className="relative aspect-[3/4] w-full rounded-b-3xl rounded-t-[12rem] object-cover shadow-2xl shadow-primary/20"
            />
            <div className="absolute -left-4 bottom-10 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-lg backdrop-blur sm:-left-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Starting from
              </p>
              <p className="font-display text-2xl text-primary">{startingPrice === null ? 'View prices' : formatPKR(startingPrice)}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
