import React from 'react';
import { motion } from 'framer-motion';

export default function BrandLoader({ message = 'Loading AT BRAND...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5] text-[#1C3A2B] transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer Circular Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-28 w-28 rounded-full border-2 border-[#1C3A2B]/10 border-t-[#C5A880] border-r-[#1C3A2B]"
        />

        {/* Brand Monogram in center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#1C3A2B]">
            AT
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-[#C5A880]">
            BRAND
          </span>
        </div>
      </div>

      <p className="mt-6 font-serif text-xs uppercase tracking-[0.25em] text-[#1C3A2B]/70">
        {message}
      </p>
    </div>
  );
}
