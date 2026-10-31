import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingCart, Plus, Minus, Trash2, Search, Scissors, ChevronDown, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { openWhatsApp, buildCartMessage, formatPKR } from '@/lib/whatsapp';
import { useBuy } from '@/contexts/BuyContext';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';

const MEN_SUB_PAGES = [
  { label: 'All Men Fabrics', to: '/men', desc: 'Complete unstitched collection' },
  { label: 'Rashid Cotton', to: '/men/rashid-cotton', desc: 'Winter warm & soft cotton finish' },
  { label: 'Ahmad Cotton', to: '/men/ahmad-cotton', desc: 'Royal crisp feel for casual & events' },
  { label: 'Wash & Wear', to: '/men/wash-and-wear', desc: 'Wrinkle-resistant daily luxury' },
  { label: 'Pure Boski', to: '/men/boski', desc: 'Traditional spun silk drape & shine' },
  { label: 'Winter Khaddar', to: '/men/khaddar', desc: 'Pure warm textured handloom weave' },
  { label: 'Egyptian Lattha', to: '/men/lattha', desc: 'Pristine white & off-white heritage' },
  { label: 'Kamalia Karandi', to: '/men/karandi', desc: 'Rich authentic Pakistani texture' },
];

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Men', to: '/men', hasSub: true },
  { label: 'Women', to: '/women' },
  { label: 'Perfumes', to: '/perfumes' },
  { label: 'Custom Stitching', to: '/stitching' },
  { label: 'Size Guide', to: '/size-guide' },
  { label: 'Shop All', to: '/shop' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(true);
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
      {/* High-Converting Top Trust & Delivery Bar for Paid & Organic Traffic */}
      <div className="bg-[#1C3A2B] text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-2 sm:gap-5 flex-wrap border-b border-[#C5A880]/30 shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-[#C5A880]" />
          <span>Flat <b>Rs. 200 Delivery</b> (Pakistan Post)</span>
        </span>
        <span className="text-[#C5A880]/60 hidden xs:inline">•</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C5A880]" />
          <span><b>Open Parcel COD:</b> Pehle Khol Kar Check Karein Phir Pay Karein</span>
        </span>
        <span className="text-[#C5A880]/60 hidden md:inline">•</span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-[#C5A880]" />
          <span><b>6 Months</b> Return Guarantee</span>
        </span>
      </div>

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
          {NAV.map((item) => {
            if (item.hasSub) {
              return (
                <div key={item.to} className="relative group py-6">
                  <Link
                    to={item.to}
                    className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] transition hover:text-primary ${
                      isActive(item.to) ? 'text-primary border-b-2 border-accent pb-1' : 'text-foreground/75'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]">Mardana Fabric Variety</p>
                      <p className="text-xs font-bold text-slate-800">Kapray Ki Type Pasand Karein</p>
                    </div>
                    <div className="space-y-1">
                      {MEN_SUB_PAGES.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className="flex flex-col rounded-xl px-3 py-2 text-left hover:bg-slate-50 transition"
                        >
                          <span className="text-xs font-extrabold text-slate-900 group-hover/sub:text-[#1C3A2B]">{sub.label}</span>
                          <span className="text-[10px] font-medium text-slate-500 leading-tight">{sub.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-xs font-semibold uppercase tracking-[0.14em] transition hover:text-primary ${
                  isActive(item.to) ? 'text-primary border-b-2 border-accent pb-1' : 'text-foreground/75'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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

          {/* Quick WhatsApp Inquiry with Exact WhatsApp Green Color & Official Logo */}
          <button
            onClick={() => openWhatsApp('Assalam-o-Alaikum AT BRAND! I have an inquiry about unstitched suits.')}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#20ba59] active:scale-95"
            style={{ boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)' }}
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
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
        <div className="border-t border-border bg-background p-6 md:hidden max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-3">
            {NAV.map((item) => {
              if (item.hasSub) {
                return (
                  <div key={item.to} className="flex flex-col border-b border-border/50 pb-2">
                    <div className="flex items-center justify-between py-1">
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={`text-sm font-bold uppercase tracking-wider ${
                          isActive(item.to) ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {item.label} Collection
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileMenOpen(!mobileMenOpen)}
                        className="p-1 text-slate-500"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {mobileMenOpen && (
                      <div className="mt-2 ml-3 flex flex-col gap-2 border-l-2 border-[#1C3A2B]/20 pl-3">
                        {MEN_SUB_PAGES.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold text-slate-700 hover:text-primary py-0.5"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-semibold uppercase tracking-wider py-1 ${
                    isActive(item.to) ? 'text-primary font-bold' : 'text-foreground/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
