import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Package, Truck, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { Input } from '@/components/ui/input';
import { trackOrder, STATUS_FLOW, statusIndex } from '@/lib/orders';
import { formatPKR, openWhatsApp, WHATSAPP_NUMBER_DISPLAY } from '@/lib/whatsapp';

const STAGES = [
  { icon: Clock, label: 'Pending' },
  { icon: CheckCircle2, label: 'Confirmed' },
  { icon: Truck, label: 'Dispatched' },
  { icon: Package, label: 'Delivered' },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null); 
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const record = await trackOrder(orderId);
      setResult(record);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStage = result ? statusIndex(result.status) : -1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Track Order AT Brand Sargodha | Mens Premium Unstitched Suits</title>
        <meta name="description" content="Track your AT Brand Sargodha order status. Enter your Order ID to get live delivery updates for your mens premium unstitched suits and shalwar kameez." />
      </Helmet>
      <Header />
      <main className="pt-16">
        <section className="border-b border-border/60 bg-secondary/40 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-10 bg-accent" />
                AT Brand Sargodha Tracking
              </p>
              <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">Track your order</h1>
              <p className="mt-4 text-muted-foreground">
                Enter the Order ID you received when placing your order for mens premium unstitched suits (e.g. AT-7F3K9Q) to see its current status.
              </p>
            </Reveal>

            <form onSubmit={lookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. AT-7F3K9Q" className="h-12 flex-1 text-base" autoComplete="off" />
              <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
                <Search className="h-4 w-4" />
                {loading ? 'Searching…' : 'Track Order'}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}