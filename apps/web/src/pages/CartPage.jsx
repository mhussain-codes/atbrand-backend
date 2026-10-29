import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBuy } from '@/contexts/BuyContext';
import { Helmet } from 'react-helmet';
import { formatPKR } from '@/lib/whatsapp';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, openCartCheckout, clearCart } = useBuy();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Shopping Cart | AT BRAND Sargodha</title>
        <meta name="description" content="View your chosen unstitched suits and stitched items in your AT BRAND shopping cart." />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-primary mb-8">
          Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-lg font-medium text-foreground">Your shopping cart is currently empty</p>
            <p className="text-sm text-muted-foreground mt-1">Explore our unstitched collection to add items.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Cart Items List */}
            <div className="lg:col-span-8 divide-y divide-border border-y border-border">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex gap-4 py-6">
                  <img
                    src={item.images?.[0] || item.image || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="h-24 w-20 flex-shrink-0 rounded-xl object-cover border border-border"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif font-bold text-primary text-base">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.type} {item.selectedColor ? `· ${item.selectedColor}` : ''}</p>
                        </div>
                        <p className="font-bold text-primary text-sm">{formatPKR(item.price * item.quantity)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center rounded-lg border border-input">
                        <button
                          onClick={() => updateQuantity(item.id, -1, item.selectedColor)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1, item.selectedColor)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.selectedColor)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPKR(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Delivery</span>
                    <span className="text-emerald-700 font-semibold">Free / COD</span>
                  </div>
                </div>

                <div className="flex justify-between text-base font-bold text-primary mb-6">
                  <span>Total Payable:</span>
                  <span>{formatPKR(total)}</span>
                </div>

                <button
                  onClick={openCartCheckout}
                  className="w-full rounded-full bg-primary py-3.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground shadow transition hover:opacity-95"
                >
                  Proceed to Checkout (COD)
                </button>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Cash on Delivery available nationwide.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
