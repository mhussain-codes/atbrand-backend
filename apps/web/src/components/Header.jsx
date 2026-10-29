import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingCart, Plus, Minus, Trash2, Search, Scissors } from 'lucide-react';
import { openWhatsApp, buildCartMessage, formatPKR } from '@/lib/whatsapp';
import { useBuy } from '@/contexts/BuyContext';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Men', to: '/men' },
  { label: 'Women', to: '/women' },
  { label: 'Perfumes', to: '/perfumes' },
  { label: 'Custom Stitching', to: '/stitching' },
  { label: 'Shop All', to: '/shop' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const { pathname } = useLocation();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, openCartCheckout } = useBuy();
  const headerRef = useRef(null);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Live Search Logic
  const searchResults = useMemo(() => {
    if (!searchInput) return [];
    const query = searchInput.toLowerCase().trim();
    return PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || (p.type && p.type.toLowerCase().includes(query)));
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setIsCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsCartOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-center">
          <span className="font-serif text-2xl font-bold tracking-[0.22em] text-primary sm:text-3xl">
            AT BRAND
          </span>
          <span className="text-[9px] uppercase tracking-[0.35em] text-accent font-semibold">
            Sargodha
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-xs font-semibold uppercase tracking-[0.14em] transition hover:text-primary ${
                isActive(item.to) ? 'text-primary border-b-2 border-accent pb-1' : 'text-foreground/75'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="rounded-full p-2 text-foreground/80 hover:bg-muted hover:text-primary"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-foreground/80 hover:bg-muted hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Quick WhatsApp Inquiry */}
          <button
            onClick={() => openWhatsApp('Assalam-o-Alaikum AT BRAND! I have an inquiry about unstitched suits.')}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Expandable Live Search */}
      {isSearchOpen && (
        <div className="border-t border-border bg-card px-4 py-4 shadow-lg sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search Men's Unstitched, Wash & Wear, Cotton, Boski..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {searchInput && (
              <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-border">
                {searchResults.map(p => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => { setIsSearchOpen(false); setSearchInput(''); }}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg text-xs"
                  >
                    <span className="font-semibold text-primary">{p.name}</span>
                    <span className="font-bold text-slate-800">{formatPKR(p.price)}</span>
                  </Link>
                ))}
                {searchResults.length === 0 && (
                  <p className="p-4 text-center text-xs text-muted-foreground">No matching products found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {open && (
        <div className="border-t border-border bg-background p-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`text-sm font-semibold uppercase tracking-wider ${
                  isActive(item.to) ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border"
            >
              Admin Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
