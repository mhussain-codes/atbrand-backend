import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBuy } from '@/contexts/BuyContext';
import { Helmet } from 'react-helmet';
import { formatPKR, openWhatsApp } from '@/lib/whatsapp';
import { createOrder } from '@/lib/orders';
import { trackPurchase } from '@/lib/adPixel';
import { toast } from 'sonner';
import { ShieldCheck, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, clearCart } = useBuy();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    city: 'Sargodha',
    notes: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 200;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createOrder({
        product: {
          isCartOrder: true,
          cartItems: cart,
          price: total,
          name: `Order of ${cart.length} items`
        },
        name: form.name,
        mobile: form.mobile,
        address: form.address,
        city: form.city
      });

      if (res && res.order_id) {
        toast.success(`Order ${res.order_id} placed successfully!`);

        // Build WhatsApp text
        const itemsText = cart.map((it, i) => `${i + 1}. ${it.name} x${it.quantity} (${formatPKR(it.price)})`).join('\n');
        const waMsg = [
          '*NEW ORDER PLACED — AT BRAND*',
          '------------------------------',
          `*Order ID:* ${res.order_id}`,
          `*Name:* ${form.name.trim()}`,
          `*Mobile:* ${form.mobile.trim()}`,
          `*Address:* ${form.address.trim()}, ${form.city}`,
          '------------------------------',
          '*Items:*',
          itemsText,
          '------------------------------',
          `*Subtotal:* ${formatPKR(subtotal)}`,
          `*Delivery (Pakistan Post):* ${formatPKR(deliveryFee)}`,
          `*Total Amount (COD):* ${formatPKR(total)}`,
          '------------------------------',
          '*Payment:* Cash on Delivery (Open Parcel available)',
          '*Delivery Time:* 3 to 4 working days',
          '------------------------------',
          'Please confirm parcel dispatch via Pakistan Post. Shukriya!'
        ].join('\n');

        clearCart();
        trackPurchase({ orderId: res.order_id, total, items: cart });
        openWhatsApp(waMsg);
        navigate(`/track-order?id=${res.order_id}`);
      } else {
        toast.error('Failed to record order. Please try again.');
      }
    } catch (err) {
      toast.error('Connection error submitting order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-xl py-20 text-center">
          <h2 className="text-xl font-bold text-primary">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">Please select items before checking out.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Checkout | AT BRAND Sargodha</title>
      </Helmet>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-primary mb-8">
          Complete Your Order (Cash on Delivery)
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Shipping Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary mb-4">1. Delivery Address</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-semibold block mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Recipient's name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="0300 1234567"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold block mb-1">City *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sargodha, Lahore, Islamabad"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background p-3"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold block mb-1">Payment Method</label>
                    <input
                      disabled
                      value="Cash on Delivery (COD)"
                      className="w-full rounded-xl border border-input bg-muted p-3 text-muted-foreground font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Street Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Complete house, street, landmark..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : `Confirm Order (${formatPKR(total)})`}
              </button>
            </form>
          </div>

          {/* Cart Breakdown */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary mb-4">Order Items</h2>
              <div className="divide-y divide-border max-h-80 overflow-y-auto mb-4">
                {cart.map((it, idx) => (
                  <div key={idx} className="flex gap-3 py-3 text-sm">
                    <img
                      src={it.images?.[0] || it.image || 'https://via.placeholder.com/80'}
                      alt={it.name}
                      className="h-14 w-12 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-primary line-clamp-1">{it.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {it.quantity} x {formatPKR(it.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery (Pakistan Post)</span>
                  <span className="text-primary font-semibold">{formatPKR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
                  <span>Total Payable:</span>
                  <span>{formatPKR(total)}</span>
                </div>
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                ✓ Open Parcel Available: Parcel khol kar check karein aur payment karein
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
