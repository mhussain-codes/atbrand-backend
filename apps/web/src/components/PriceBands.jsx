import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

const BANDS = [
  {
    id: '1000-2000',
    name: 'The Everyday',
    range: 'PKR 1,000 – 2,000',
    desc: 'Breathable Ahmad Cotton and wash & wear staples made for daily wear.',
    featured: false,
  },
  {
    id: '2000-3000',
    name: 'The Signature',
    range: 'PKR 2,000 – 3,000',
    desc: 'Refined weaves and richer colours, finished with premium stitching.',
    featured: true,
  },
  {
    id: '3000-4000',
    name: 'The Royal',
    range: 'PKR 3,000 – 4,000',
    desc: 'Pure Boski and heavy Khaddar — occasion wear that commands the room.',
    featured: false,
  },
];

export default function PriceBands({ onSelect }) {
  return (
    <section id="price-guide" className="scroll-mt-20 bg-secondary/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-10 bg-accent" />
            Price Guide
          </p>
          <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
            Honest pricing, three tiers.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Cotton wash &amp; wear and every other fabric, grouped by budget — pick a tier and
            we&apos;ll show you the pieces.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BANDS.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
                  b.featured
                    ? 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                    : 'border-border bg-card text-foreground shadow-sm hover:shadow-lg'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                    b.featured ? 'text-accent' : 'text-accent'
                  }`}
                >
                  {b.range}
                </p>
                <h3 className="mt-3 font-display text-3xl">{b.name}</h3>
                <p
                  className={`mt-3 flex-1 text-sm leading-relaxed ${
                    b.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {b.desc}
                </p>
                <button
                  onClick={() => onSelect(b.id)}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    b.featured
                      ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  View pieces
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
