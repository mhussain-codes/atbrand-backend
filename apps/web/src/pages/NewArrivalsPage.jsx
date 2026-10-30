import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { PRODUCTS, TYPES } from '@/data/products';

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

export default function NewArrivalsPage() {
  const [typeFilter, setTypeFilter] = useState('all');

  const newArrivals = useMemo(() => PRODUCTS.filter((p) => p.isNew), []);
  const filtered = useMemo(
    () => (typeFilter === 'all' ? newArrivals : newArrivals.filter((p) => p.type === typeFilter)),
    [newArrivals, typeFilter]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>New Men's Unstitched Suit Arrivals | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="See the latest additions to AT BRAND's men's unstitched collection, including current fabrics and colours. Browse product details and order online in Pakistan."
        />
        <link rel="canonical" href="https://atbrand.store/new-arrivals" />
      </Helmet>

      <Header />
      <main className="pt-16">
        <section className="border-b border-border/60 bg-secondary/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-10 bg-accent" />
                Just Landed
              </p>
              <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">New Arrivals</h1>
              <p className="mt-4 max-w-xl text-muted-foreground">
                The latest additions to the AT BRAND collection — fresh fabrics, new colours, and
                premium stitching ready to ship.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Fabric
              </span>
              <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All</Chip>
              {TYPES.map((t) => (
                <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
              ))}
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> new{' '}
              {filtered.length === 1 ? 'piece' : 'pieces'}
            </p>

            {filtered.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                <p className="font-display text-2xl text-foreground">No new pieces in this fabric yet</p>
                <button
                  onClick={() => setTypeFilter('all')}
                  className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                >
                  Show all fabrics
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
