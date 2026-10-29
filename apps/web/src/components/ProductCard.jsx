import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { buildInquiryMessage, formatPKR, openWhatsApp } from '@/lib/whatsapp';
import { useBuy } from '@/contexts/BuyContext';

export default function ProductCard({ product }) {
  const { openBuy, addToCart } = useBuy();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const isBudgetSection = Number(product.price) <= 2000;
  const availableColors = product.colors || [];
  const [selectedColor, setSelectedColor] = useState(availableColors.length > 0 ? availableColors[0] : null);

  useEffect(() => {
    setCurrentIndex(0);
    setImageFailed(false);
  }, [selectedColor, product]);

  // Yeh line sabhi possible image formats/arrays ko safely ek jagah collect karti hai
  const images = Array.from(new Set([
    ...(selectedColor && Array.isArray(selectedColor.images) ? selectedColor.images : []),
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.image_urls) ? product.image_urls : []),
    product.image_url,
    product.image,
  ].filter((url) => typeof url === 'string' && url.trim())));

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setImageFailed(false);
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setImageFailed(false);
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const getProductData = () => {
    return { 
      ...product, 
      selectedColor: selectedColor ? selectedColor.name : undefined, 
      image: images[currentIndex] || product.image 
    };
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transform-gpu will-change-transform">

      {/* Image Section */}
      <div className="relative overflow-hidden bg-muted">
        {images.length > 0 && !imageFailed ? (
          <img
            src={images[currentIndex]}
            alt={`${product.name || "Mens Premium Unstitched Suit"} - ${product.type || "Shalwar Kameez"} by AT Brand Sargodha`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105 transform-gpu will-change-transform"
          />
        ) : (
          <div className="flex aspect-[3/4] w-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}

        {product.type && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            {product.type}
          </span>
        )}

        {product.isNew && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            New
          </span>
        )}

        {/* Slider Controls - Sirf tabhi show honge jab total images 1 se zyada honge */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow backdrop-blur transition-all duration-200 hover:bg-background opacity-0 group-hover:opacity-100 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow backdrop-blur transition-all duration-200 hover:bg-background opacity-0 group-hover:opacity-100 active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-4 bg-primary' : 'w-1.5 bg-primary/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl text-foreground">
          {product.name || "Mens Premium Unstitched Suit"}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {product.fabric || "Premium Unstitched Shalwar Kameez"}
        </p>
        <p className="mt-2 text-lg font-semibold text-primary">{product.price ? formatPKR(product.price) : "PKR 1,500"}</p>

        {isBudgetSection && availableColors.length > 0 && selectedColor && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Color: <span className="text-foreground font-semibold">{selectedColor.name}</span>
            </p>
            <div className="flex gap-2">
              {availableColors.name && availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    selectedColor.name === color.name ? 'border-primary scale-110' : 'border-transparent shadow-sm'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Order Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => {
              addToCart(getProductData());
              alert(`${product.name || 'Mens Premium Unstitched Suit'} added to cart!`);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-primary px-2 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10 active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </button>

          <button
            onClick={() => openBuy(getProductData())}
            className="flex-1 rounded-full bg-primary px-2 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
          >
            Buy Now
          </button>

          <button
            onClick={() => openWhatsApp(buildInquiryMessage(getProductData()))}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}