import React from 'react';

const ITEMS = [
  'Ahmad Cotton',
  'Wash & Wear',
  'Premium Boski',
  'Winter Khaddar',
  'AT BRAND · Sargodha',
  'Cash on Delivery',
  'Nationwide Shipping',
  'From PKR 1,350',
];

export default function Marquee() {
  return (
    <section aria-hidden="true" className="overflow-hidden border-y border-primary/20 bg-primary py-3.5">
      <div className="animate-marquee flex w-max items-center gap-10">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/90"
          >
            {item}
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
          </span>
        ))}
      </div>
    </section>
  );
}
