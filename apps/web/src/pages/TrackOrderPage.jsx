import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, AlertCircle, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { trackOrder, STATUS_FLOW, statusIndex } from '@/lib/orders';
import { formatPKR, openWhatsApp, WHATSAPP_NUMBER_DISPLAY } from '@/lib/whatsapp';

const STAGES = [
  { key: 'Pending', icon: Clock, label: 'Order Placed', desc: 'Received & awaiting verification' },
  { key: 'Confirmed', icon: CheckCircle2, label: 'Confirmed', desc: 'Fabric inspected & packed' },
  { key: 'Dispatched', icon: Truck, label: 'Dispatched', desc: 'Handed over to courier' },
  { key: 'Delivered', icon: Package, label: 'Delivered', desc: 'Delivered to your doorstep' },
];

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async (idToSearch) => {
    const id = (idToSearch || orderId).trim();
    if (!id) return;
    setLoading(true);
    setSearched(true);
    setNotFound(false);
    try {
      const record = await trackOrder(id);
      if (record && record.order_number) {
        setResult(record);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      lookup(idFromUrl);
    }
  }, [searchParams]);

  const isCancelled = result && result.status === 'Cancelled';
  const currentStage = result ? statusIndex(result.status) : -1;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Helmet>
        <title>Track Order | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Live tracking for your AT BRAND Sargodha order. Check dispatch status, courier tracking, and delivery progress."
        />
      </Helmet>

      <Header />

      <main className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header Section */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">
              Real-Time Shipment Tracking
            </p>
            <h1 className="mt-2 font-serif text-3xl font-extrabold text-[#1C3A2B] sm:text-5xl">
              Track Your Order
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-600">
              Enter your unique Order ID (e.g. <b>AT-7F3K9Q</b>) sent upon order confirmation to see live status updates.
            </p>
          </div>

          {/* Search Box */}
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm mb-10">
            <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter Order ID (e.g. AT-ABC123)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-base font-bold text-slate-900 focus:border-[#1C3A2B] focus:outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C3A2B] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow hover:opacity-95 disabled:opacity-50 transition"
              >
                {loading ? 'Verifying...' : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Order Details & Stepper */}
          {result && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm">
              {/* Top Order Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Reference</span>
                  <h2 className="font-mono text-2xl font-black text-[#1C3A2B]">{result.order_number}</h2>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    Customer: <b className="text-slate-900">{result.customer_name}</b> · {result.city || 'Sargodha'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</span>
                  <div className="mt-1">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-xs font-black text-red-700">
                        <XCircle className="h-4 w-4" /> Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" /> {result.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Courier Information if available */}
              {(result.courier_name || result.tracking_number) && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 mb-8 text-xs text-blue-950 font-semibold flex items-center justify-between">
                  <div>
                    <span className="text-blue-600 block text-[10px] uppercase font-bold">Courier Partner</span>
                    <span className="text-sm font-extrabold">{result.courier_name || 'TCS / Leopards'}</span>
                  </div>
                  {result.tracking_number && (
                    <div>
                      <span className="text-blue-600 block text-[10px] uppercase font-bold">Courier Tracking #</span>
                      <span className="text-sm font-mono font-extrabold text-blue-900">{result.tracking_number}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Status Stepper */}
              {!isCancelled ? (
                <div className="py-4 mb-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                    {STAGES.map((stg, idx) => {
                      const Icon = stg.icon;
                      const isCompleted = idx <= currentStage;
                      const isCurrent = idx === currentStage;

                      return (
                        <div key={stg.key} className="flex flex-col items-center text-center">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                              isCompleted
                                ? 'border-[#1C3A2B] bg-[#1C3A2B] text-white shadow-md'
                                : 'border-slate-300 bg-slate-100 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-[#C5A880]/40 scale-105' : ''}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className={`mt-3 text-xs font-black uppercase tracking-wider ${isCompleted ? 'text-[#1C3A2B]' : 'text-slate-400'}`}>
                            {stg.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                            {stg.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-red-50 p-5 border border-red-200 text-center mb-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
                  <p className="text-sm font-bold text-red-800">This order has been cancelled</p>
                  <p className="text-xs text-red-600 mt-1">If you have any questions or would like to reactivate this order, please contact our helpline.</p>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-extrabold text-slate-900 text-sm mb-4">Purchased Items</h3>
                <div className="divide-y divide-slate-100 mb-4">
                  {Array.isArray(result.items) && result.items.length > 0 ? (
                    result.items.map((it, i) => (
                      <div key={i} className="flex justify-between py-2.5 text-xs font-semibold">
                        <span className="text-slate-800">
                          {it.name || it.product_name} {it.selectedColor ? `(${it.selectedColor})` : ''} × {it.quantity || 1}
                        </span>
                        <span className="font-bold text-slate-900">{formatPKR(it.price * (it.quantity || 1))}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between py-2 text-xs font-semibold">
                      <span className="text-slate-800">{result.product_name || 'Men’s Unstitched Suit'}</span>
                      <span className="font-bold text-slate-900">{formatPKR(result.total_amount || result.price)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-slate-900">
                  <span>Total (Cash on Delivery):</span>
                  <span>{formatPKR(result.total_amount || result.price)}</span>
                </div>
              </div>

              {/* Help & Contact Support */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Need assistance with your delivery?</span>
                <button
                  onClick={() => openWhatsApp(`Assalam-o-Alaikum! I need an update regarding my Order ID: ${result.order_number}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#20ba59]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Chat on WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {searched && notFound && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
              <h3 className="font-bold text-slate-900 text-lg">Order Not Found</h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-slate-600 leading-relaxed">
                We couldn't locate an active order matching <b>"{orderId}"</b>. Please double-check your Order Reference ID from WhatsApp or SMS.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => openWhatsApp(`Assalam-o-Alaikum! Could you please help me track my order? ID: ${orderId}`)}
                  className="rounded-full bg-[#25D366] px-6 py-2.5 text-xs font-bold text-white shadow"
                >
                  Contact Support on WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
