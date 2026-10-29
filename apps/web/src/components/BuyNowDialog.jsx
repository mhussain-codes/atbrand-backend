import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { buildOrderMessage, formatPKR, openWhatsApp } from '@/lib/whatsapp';
import { createOrder } from '@/lib/orders';

const EMPTY = { name: '', mobile: '', address: '' };

export default function BuyNowDialog({ product, open, onOpenChange }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null); 

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setPlaced(null);
    }
  }, [open, product]);

  if (!product) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Please enter your full name.';
    const digits = form.mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12)
      e.mobile = 'Enter a valid mobile number, e.g. 0300 1234567.';
    if (form.address.trim().length < 10)
      e.address = 'Please enter your complete delivery address with city.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    
    try {
      const scriptURL = "https://script.google.com/macros/s/AKfycbzamlcxwrcuVaBpTpS5iYx0PqAzxZwXkNRS_6KYkgQzqklIpr4jMnfMpnRESG853Rvk/exec";
      const sheetData = new FormData();
      sheetData.append('name', form.name);
      sheetData.append('phone', form.mobile);
      sheetData.append('address', form.address);

      fetch(scriptURL, {
        method: 'POST',
        body: sheetData,
        mode: 'no-cors'
      }).then(() => {
        console.log("Data sent to Google Sheet");
      }).catch(err => {
        console.error("Sheet error", err);
      });

      const { order_id } = await createOrder({ product, ...form });
      setPlaced({ orderId: order_id });
      openWhatsApp(buildOrderMessage({ product, ...form, orderId: order_id }));
      toast.success('Order placed! Opening WhatsApp…');
      
    } catch (err) {
      toast.error('Could not place order. Please try again or order on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    if (!placed) return;
    navigator.clipboard?.writeText(placed.orderId);
    toast.success('Order ID copied');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-3xl p-5 sm:p-6 bg-background">
        {placed ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <DialogTitle className="mt-4 font-display text-2xl">Order placed!</DialogTitle>
            <DialogDescription className="mt-2">
              Save your Order ID to track your delivery status anytime.
            </DialogDescription>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order ID</span>
              <span className="font-display text-xl text-primary">{placed.orderId}</span>
              <button
                onClick={copyId}
                aria-label="Copy order ID"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition hover:bg-primary/10 hover:text-primary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/track-order"
                onClick={() => onOpenChange(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
              >
                Track My Order
              </Link>
              <button
                onClick={() => onOpenChange(false)}
                className="text-sm font-medium text-muted-foreground transition hover:text-primary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="text-left mb-2">
              <DialogTitle className="font-display text-2xl">Complete your order</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Your details are sent to us as a pre-filled WhatsApp message.
              </DialogDescription>
            </DialogHeader>

            {/* FIX: Bilkul Cart jaisa design, choti image (w-20 h-24) aur product.type use kiya gaya hai */}
            <div className="flex gap-4 border border-border rounded-xl p-3 bg-background shadow-sm w-full">
              <img
                src={product.images?.[0] || product.image || ''}
                alt={`${product.name} - Mens Premium Unstitched Suit`}
                className="w-20 h-24 object-cover rounded-md shrink-0"
              />
              <div className="flex flex-1 flex-col justify-center">
                <h3 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h3>
                <p className="text-[11px] text-muted-foreground uppercase mt-1">{product.type || product.fabric}</p>
                <p className="font-medium text-primary mt-1.5">{formatPKR(product.price)}</p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={submit} className="space-y-4 mt-4 w-full" noValidate>
              <div className="space-y-1.5 w-full text-left">
                <Label htmlFor="order-name">Full Name</Label>
                <Input
                  id="order-name"
                  placeholder="e.g. Muhammad Ahmed Khan"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                  className="w-full bg-background"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5 w-full text-left">
                <Label htmlFor="order-mobile">Mobile Number</Label>
                <Input
                  id="order-mobile"
                  type="tel"
                  placeholder="e.g. 0300 1234567"
                  value={form.mobile}
                  onChange={set('mobile')}
                  autoComplete="tel"
                  className="w-full bg-background"
                />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
              </div>

              <div className="space-y-1.5 w-full text-left">
                <Label htmlFor="order-address">Delivery Address</Label>
                <Textarea
                  id="order-address"
                  placeholder="House, street, area, city"
                  rows={2}
                  value={form.address}
                  onChange={set('address')}
                  autoComplete="street-address"
                  className="resize-none w-full bg-background"
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full mt-2 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-primary/20"
              >
                <MessageCircle className="h-5 w-5" />
                {submitting ? 'Placing order…' : 'Confirm Order on WhatsApp'}
              </button>

              <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-muted-foreground w-full uppercase tracking-wide">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Cash on delivery nationwide
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}