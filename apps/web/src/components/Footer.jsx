import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Mail, Facebook } from 'lucide-react';
import {
  openWhatsApp,
  WHATSAPP_NUMBER_DISPLAY,
  SUPPORT_EMAIL,
} from '@/lib/whatsapp';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div>
          {/* SEO Updated Brand Name */}
          <p className="font-display text-3xl tracking-[0.18em]">AT BRAND</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-primary-foreground/60">
            Menswear · Sargodha
          </p>
          {/* SEO Updated Footer Description */}
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-primary-foreground/75">
            Shop the finest mens premium unstitched suits and shalwar kameez at AT Brand Sargodha. Offering Ahmad Cotton, Wash &amp; Wear, Boski, and Khaddar — delivered nationwide across Pakistan with cash on delivery.
          </p>
          
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.tiktok.com/@atbrand06?_r=1&_t=ZS-99DAyxqRZ6A"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:border-primary-foreground hover:text-primary-foreground"
              aria-label="TikTok"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/1DDvx5oVCs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:border-primary-foreground hover:text-primary-foreground"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Men's Sub-Pages Column for High SEO Ranking */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Men's Fabrics</p>
          <nav className="mt-4 flex flex-col gap-2 text-xs">
            <Link to="/men" className="text-primary-foreground/80 transition hover:text-primary-foreground font-semibold">All Men's Suits</Link>
            <Link to="/men/rashid-cotton" className="text-primary-foreground/80 transition hover:text-primary-foreground">Rashid Cotton Suits</Link>
            <Link to="/men/ahmad-cotton" className="text-primary-foreground/80 transition hover:text-primary-foreground">Ahmad Cotton Collection</Link>
            <Link to="/men/wash-and-wear" className="text-primary-foreground/80 transition hover:text-primary-foreground">Premium Wash & Wear</Link>
            <Link to="/men/boski" className="text-primary-foreground/80 transition hover:text-primary-foreground">Executive Pure Boski</Link>
            <Link to="/men/khaddar" className="text-primary-foreground/80 transition hover:text-primary-foreground">Winter Warm Khaddar</Link>
            <Link to="/men/lattha" className="text-primary-foreground/80 transition hover:text-primary-foreground">Egyptian Cotton Lattha</Link>
            <Link to="/men/karandi" className="text-primary-foreground/80 transition hover:text-primary-foreground">Kamalia Karandi</Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Quick Links</p>
          <nav className="mt-4 flex flex-col gap-2 text-xs">
            <Link to="/" className="text-primary-foreground/80 transition hover:text-primary-foreground">Home</Link>
            <Link to="/shop" className="text-primary-foreground/80 transition hover:text-primary-foreground">Shop All</Link>
            <Link to="/stitching" className="text-primary-foreground/80 transition hover:text-primary-foreground">Custom Tailoring</Link>
            <Link to="/new-arrivals" className="text-primary-foreground/80 transition hover:text-primary-foreground">New Arrivals</Link>
            <Link to="/track-order" className="text-primary-foreground/80 transition hover:text-primary-foreground">Track Order</Link>
            <Link to="/size-guide" className="text-primary-foreground/80 transition hover:text-primary-foreground">Size Guide</Link>
            <Link to="/shipping-policy" className="text-primary-foreground/80 transition hover:text-primary-foreground">Shipping Policy</Link>
            <Link to="/return-policy" className="text-primary-foreground/80 transition hover:text-primary-foreground">Return & Refund Policy</Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Store & Contact</p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-primary-foreground/80">
            <button
              onClick={() => openWhatsApp('Assalam-o-Alaikum! I would like to place an order from AT Brand Sargodha.')}
              className="flex items-center gap-2 text-left transition hover:text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
              WhatsApp: {WHATSAPP_NUMBER_DISPLAY}
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 transition hover:text-primary-foreground"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              {SUPPORT_EMAIL}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Street 17, Y Block, Near Baba Heer Masjid, New Satellite Town, Sargodha, Pakistan.
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              Mon – Sun, 10:00 AM – 9:00 PM
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6">
          {/* SEO Updated Copyright */}
          <p>© {year} AT Brand Sargodha. All rights reserved.</p>
          <p>Cash on delivery · Nationwide shipping across Pakistan</p>
        </div>
      </div>
    </footer>
  );
}