import React from 'react';
import { ShoppingBag, PenLine, MessageCircle, Banknote } from 'lucide-react';
import Reveal from '@/components/Reveal';

const STEPS = [
  {
    icon: ShoppingBag,
    title: 'Choose your piece',
    desc: 'Browse by fabric or price tier and find the shalwar kameez that fits your style.',
  },
  {
    icon: PenLine,
    title: 'Tap Buy Now',
    desc: 'Enter your name, mobile number and delivery address — it takes under a minute.',
  },
  {
    icon: MessageCircle,
    title: 'Confirm on WhatsApp',
    desc: 'Your order arrives to us as a neatly formatted WhatsApp message. We confirm and dispatch.',
  },
];

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-10 bg-accent" />
            How to Order
          </p>
          <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
            Ordered in three taps.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="relative border-t-2 border-primary/15 pt-8">
                <span className="absolute -top-5 left-0 font-display text-6xl text-accent/30">
                  0{i + 1}
                </span>
                <s.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-display text-2xl text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-col items-center justify-center gap-3 rounded-3xl border border-accent/30 bg-accent/10 px-6 py-8 text-center sm:flex-row sm:gap-4">
            <Banknote className="h-6 w-6 text-accent" />
            <p className="text-sm font-medium text-foreground sm:text-base">
              Cash on delivery available across Pakistan — pay only when your order arrives.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
