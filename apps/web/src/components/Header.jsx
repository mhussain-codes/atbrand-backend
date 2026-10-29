import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import { openWhatsApp, buildCartMessage, formatPKR } from '@/lib/whatsapp';
import { useBuy } from '@/contexts/BuyContext';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];

const colorSynonyms = {
  'blue': ['blue', 'sky blue', 'medium blue', 'ice blue', 'arctic blue', 'slate blue', 'powder blue', 'navy', 'peacock', 'zink', 'aqua'],
  'white': ['white', 'pure white', 'off-white', 'off white', 'cream', 'ivory', 'milk white', 'beige'],
  'brown': ['brown', 'camel', 'khaki', 'caramel', 'peanut', 'chocolate', 'taupe', 'latte', 'rust'],
  'green': ['green', 'olive', 'sage', 'mint', 'pistachio'],
  'grey': ['grey', 'gray', 'charcoal', 'slate', 'steel'],
  'purple': ['purple', 'lilac', 'lavender', 'plum', 'mauve', 'violet'],
  'red': ['red', 'burgundy', 'maroon', 'rose', 'dusty rose'],
  'yellow': ['yellow', 'mustard'],
  'black': ['black', 'soft black']
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const { pathname } = useLocation();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, openCartCheckout } = useBuy();

  // Ref for Click Outside Detection
  const headerRef = useRef(null);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Live Search Logic
  const searchResults = useMemo(() => {
    if (!searchInput) return [];
    const query = searchInput.toLowerCase().trim();
    const searchTerms = colorSynonyms[query] || [query];
    
    return PRODUCTS.filter(p => {
      const nameStr = p.name.toLowerCase();
      const colorsStr = p.colors ? p.colors.map(c => c.name.toLowerCase()).join(" ") : "";
      return searchTerms.some(term => nameStr.includes(term) || colorsStr.includes(term));
    });
  }, [searchInput]);

  // Click Outside Listener (Side par click karne se close ho jayega)
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        if (open) setOpen(false); // Mobile menu bhi side par click se close ho jayega
      }
    }
    
    if (isSearchOpen || open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, open]);

  return (
    <>
      {/* Header ke oopar ref laga diya taake bahar click detect ho sake */}
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 bg-background/85 backdrop-blur-md">
        <div className="relative z-50 border-b border-border/70 bg-background/50">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link to="/" aria-label="AT Brand Sargodha - Home" className="flex items-baseline gap-2" onClick={() => {setOpen(false); setIsSearchOpen(false);}}>
              <span className="font-display text-2xl tracking-[0.18em] text-primary">AT BRAND</span>
              <span className="hidden text-[10px] uppercase tracking-[0.35em] text-muted-foreground sm:inline">
                Menswear · Sargodha
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition hover:text-primary ${
                    isActive(l.to) ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Toggle Button */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (open) setOpen(false); 
                }}
                aria-label="Search Collection"
                className={`relative inline-flex items-center justify-center p-2 transition hover:text-primary ${isSearchOpen ? 'text-primary' : 'text-foreground'}`}
              >
                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              <button 
                onClick={() => setIsCartOpen(true)}
                aria-label="View Shopping Cart"
                className="relative inline-flex items-center justify-center p-2 text-foreground transition hover:text-primary"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => openWhatsApp('Assalam-o-Alaikum! I would like to place an order for mens premium unstitched suits from AT Brand Sargodha.')}
                className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:inline-flex"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground md:hidden"
                onClick={() => {
                  setOpen((v) => !v);
                  if (isSearchOpen) setIsSearchOpen(false);
                }}
                aria-label="Toggle Menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Header Live Search Dropdown */}
        <div 
          className={`absolute left-0 w-full bg-background border-b border-border/50 shadow-lg transition-all duration-300 ease-in-out z-40 ${
            isSearchOpen ? 'top-16 opacity-100 visible' : 'top-10 opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className="mx-auto max-w-6xl p-4 sm:px-6">
            <div className="relative flex items-center max-w-3xl mx-auto">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                autoFocus={isSearchOpen}
                placeholder="Search colors (e.g. blue, brown, red)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-border bg-secondary/30 py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            </div>
            
            {searchInput && (
              <div className="mt-6 max-h-[65vh] overflow-y-auto pb-6">
                <p className="mb-4 text-sm font-medium text-muted-foreground text-center">
                  Found {searchResults.length} {searchResults.length === 1 ? 'piece' : 'pieces'}
                </p>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {searchResults.map((p) => (
                      <div key={p.id} onClick={() => setIsSearchOpen(false)}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground text-sm">No products found for "{searchInput}".</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-border/70 bg-background md:hidden relative z-50">
            <nav className="flex flex-col px-4 py-2">
              {NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`border-b border-border/50 py-3.5 text-sm font-medium last:border-0 ${
                    isActive(l.to) ? 'text-primary' : 'text-foreground/85'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); setIsCartOpen(true); }}
                className="mt-2 flex items-center justify-between border-b border-border/50 py-3.5 text-sm font-medium text-foreground/85"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> View Cart
                </span>
                {totalItems > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  openWhatsApp('Assalam-o-Alaikum! I would like to place an order for mens premium unstitched suits from AT Brand Sargodha.');
                }}
                className="my-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Order on WhatsApp
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {totalItems > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-card border border-border shadow-xl transition-transform hover:scale-105 active:scale-95 text-foreground"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-md">
              {totalItems}
            </span>
          </button>
        )}
        <button
          onClick={() => openWhatsApp('Assalam-o-Alaikum! I have an inquiry for AT Brand Sargodha.')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </div>

      {/* Cart Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-all duration-300 ${
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-[90%] sm:w-96 bg-card border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isCartOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5" /> Shopping Cart ({totalItems})
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="p-2 rounded-full hover:bg-muted transition text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border border-border rounded-xl p-3 bg-background shadow-sm">
                <img 
                  src={item.images?.[0] || item.image} 
                  alt={`${item.name} - Mens Premium Unstitched Suit`} 
                  className="w-20 h-24 object-cover rounded-md" 
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                    <p className="text-[11px] text-muted-foreground uppercase">{item.type}</p>
                    <p className="font-medium text-primary mt-1">{formatPKR(item.price * item.quantity)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-lg bg-card">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="px-2.5 py-1.5 hover:bg-muted text-foreground transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-foreground flex items-center justify-center min-w-[20px]">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="px-2.5 py-1.5 hover:bg-muted text-foreground transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-background">
            <div className="flex justify-between items-center mb-4 text-foreground">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold text-xl text-primary">{formatPKR(totalPrice)}</span>
            </div>
            <button
              onClick={openCartCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <MessageCircle className="h-5 w-5" />
              Buy Now via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}