import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';
import { Ruler, CheckCircle2 } from 'lucide-react';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Size & Measurement Guide | AT BRAND Sargodha</title>
        <meta
          name="description"
          content="Complete Pakistani men's unstitched suits and stitched kurta shalwar size guide. Learn how to take accurate chest, length, and shoulder measurements."
        />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Precision Fit Standards</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl">
            Measurement & Size Guide
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Detailed dimensions for both unstitched fabric cuts (4 or 4.5 meters standard bar) and ready stitched kurta shalwar.
          </p>
        </div>

        {/* Unstitched Cutting Standards */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Ruler className="h-6 w-6 text-accent" />
            <h2 className="font-serif text-2xl font-bold text-primary">Standard Unstitched Suit Dimensions</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            All AT BRAND unstitched suits are cut from premium factory rolls with generous margins to comfortably accommodate tall and broad builds up to 6'4" height.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-background p-5">
              <h4 className="font-bold text-primary text-sm mb-1">Standard Cut (Bara Arz / Double Width)</h4>
              <p className="text-2xl font-bold text-accent my-2">4.0 Meters</p>
              <p className="text-xs text-muted-foreground">Arz: 54 - 58 inches. Perfect for complete Kurta and Shalwar for standard to large sizes.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <h4 className="font-bold text-primary text-sm mb-1">Single Width Cut (Chhota Arz)</h4>
              <p className="text-2xl font-bold text-accent my-2">4.5 Meters</p>
              <p className="text-xs text-muted-foreground">Arz: 36 - 40 inches. Standard Pakistani width suitable for complete men's traditional suit.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <h4 className="font-bold text-primary text-sm mb-1">Kurta Fabric Only</h4>
              <p className="text-2xl font-bold text-accent my-2">2.25 Meters</p>
              <p className="text-xs text-muted-foreground">Ideal for standalone Kurtas to pair with contrasting white or off-white shalwar or trousers.</p>
            </div>
          </div>
        </div>

        {/* Ready Stitched Kurta Shalwar Size Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Stitched Kurta Shalwar Size Chart (Inches)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Length</th>
                  <th className="p-3">Shoulder (Teera)</th>
                  <th className="p-3">Sleeves</th>
                  <th className="p-3">Neck / Collar</th>
                  <th className="p-3">Shalwar Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-bold text-primary">Small (S)</td>
                  <td className="p-3">38" - 40"</td>
                  <td className="p-3">38"</td>
                  <td className="p-3">17"</td>
                  <td className="p-3">23.5"</td>
                  <td className="p-3">14.5"</td>
                  <td className="p-3">38"</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">Medium (M)</td>
                  <td className="p-3">41" - 43"</td>
                  <td className="p-3">40"</td>
                  <td className="p-3">18"</td>
                  <td className="p-3">24.5"</td>
                  <td className="p-3">15.5"</td>
                  <td className="p-3">40"</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">Large (L)</td>
                  <td className="p-3">44" - 46"</td>
                  <td className="p-3">42"</td>
                  <td className="p-3">19"</td>
                  <td className="p-3">25.5"</td>
                  <td className="p-3">16.5"</td>
                  <td className="p-3">42"</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">Extra Large (XL)</td>
                  <td className="p-3">47" - 49"</td>
                  <td className="p-3">44"</td>
                  <td className="p-3">20"</td>
                  <td className="p-3">26"</td>
                  <td className="p-3">17.5"</td>
                  <td className="p-3">43"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
