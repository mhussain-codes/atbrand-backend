import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    customer_name: 'Chaudhry Kamran',
    city: 'Sargodha',
    rating: 5,
    comment: 'MashaAllah Ahmad Cotton ka fall aur finishing kamal hai. Tali Chowk shop se pehle leta tha ab online mangwaya, same 100% original quality mili.',
    suit_name: 'Ahmad Cotton Royal White'
  },
  {
    id: 'rev-2',
    customer_name: 'Malik Zeeshan Tariq',
    city: 'Lahore',
    rating: 5,
    comment: 'Washing k baad bhi kapray ki chamak aur graceful fall bilkul fresh rahi. Rashid Cotton winter suit ki warm feel bohot umdah hai. Highly recommended!',
    suit_name: 'Rashid Cotton Winter Grey'
  },
  {
    id: 'rev-3',
    customer_name: 'Haji Abdul Rehman',
    city: 'Rawalpindi',
    rating: 5,
    comment: 'ماشاءاللہ بہت نفیس اور پائیدار کپڑا ہے۔ سلائی کے بعد سوٹ کی خوبصورتی مزید نکھر گئی۔ سرگودھا کا سب سے قابلِ اعتماد برانڈ ہے۔',
    suit_name: 'Executive Boski Fall'
  },
  {
    id: 'rev-4',
    customer_name: 'Usman Farooq',
    city: 'Islamabad',
    rating: 5,
    comment: 'Cash on delivery par 2 din me parcel mil gya. Fabric box packaging bht premium thi. Wash & Wear daily use k lye perfect hai, wrinkles bilkul nhi parte.',
    suit_name: 'Premium Wash & Wear Cream'
  },
  {
    id: 'rev-5',
    customer_name: 'Bilal Ahmad Gujjar',
    city: 'Faisalabad',
    rating: 5,
    comment: 'Silai k sath order kya tha, master tailor ki cutting aur sherwani ban fitting bilkul exact standard size k mutabiq aayi. Bohat shukriya Arslan bhai!',
    suit_name: 'Ahmad Cotton Sky Blue'
  },
  {
    id: 'rev-6',
    customer_name: 'Syed Hamza Ali',
    city: 'Multan',
    rating: 5,
    comment: 'Lattha aur cotton dono mangwaye thay. 100% pure cotton feel hai, garmiyon me pehnne k lye nihayat thanda aur aaramdeh fabric.',
    suit_name: 'Pure Egyptian Lattha White'
  }
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    city: 'Sargodha',
    suit_name: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.comment.trim()) {
      toast.error('Please enter your name and review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Shukriya! Apka review admin verification k baad website par show ho jayega.');
        setShowModal(false);
        setForm({
          customer_name: '',
          city: 'Sargodha',
          suit_name: '',
          rating: 5,
          comment: ''
        });
      } else {
        toast.error(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      toast.error('Network connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-50/70 py-20 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1C3A2B]/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.25em] text-[#1C3A2B]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C5A880]" />
            Customer Trust & Feedback
          </div>
          <h2 className="mt-3 font-serif text-3xl font-extrabold text-[#1C3A2B] sm:text-5xl">
            Real Words from Real Gentlemen
          </h2>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm font-medium text-slate-600">
            Hazaaroon mutma'in customers ka bharosa. Har suit ki chamak, fall aur unstitched quality ki zinda misaal.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1C3A2B] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#152c20] transition active:scale-95"
          >
            <MessageSquarePlus className="h-4 w-4 text-[#C5A880]" />
            Write a Review (Apna Review Dein)
          </button>
        </div>
      </div>

      {/* Moving Marquee Slider Container */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] py-2">
          {/* Double array for seamless infinite looping */}
          {[...reviews, ...reviews].map((rev, idx) => (
            <div
              key={`${rev.id}-${idx}`}
              className="w-[320px] sm:w-[380px] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#1C3A2B]/30 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle className="h-3 w-3" />
                    Verified Buyer
                  </span>
                </div>

                {/* Review Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {rev.customer_name}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500">
                    📍 {rev.city || 'Sargodha'}
                  </p>
                </div>
                {rev.suit_name && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] bg-[#1C3A2B]/5 px-2.5 py-1 rounded-md max-w-[140px] truncate">
                    {rev.suit_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C3A2B]">
                  Share Your Experience
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Apka review doosre logon ka aitmaad barhane me madad karega.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-800">Your Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Malik Usman"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">City *</label>
                  <input
                    required
                    type="text"
                    placeholder="Sargodha, Lahore, etc."
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Suit Purchased (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rashid Cotton Winter Grey / Ahmad Cotton"
                  value={form.suit_name}
                  onChange={(e) => setForm({ ...form, suit_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Your Review / Comment *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Apna tajruba likhein (Roman Urdu, Urdu ya English)... Fabric kaisa tha? Washing k baad color kaisa rha? Delivery service kesi thi?"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#1C3A2B] px-6 py-2.5 uppercase tracking-wider text-white font-extrabold shadow hover:bg-[#152c20] transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}