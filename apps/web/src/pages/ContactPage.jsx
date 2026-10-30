import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { MessageCircle, MapPin, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  openWhatsApp,
  WHATSAPP_NUMBER_DISPLAY,
  SUPPORT_EMAIL,
  STORE_LOCATION,
} from '@/lib/whatsapp';

const EMPTY = { name: '', mobile: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 3) err.name = 'Please enter your name.';
    const digits = form.mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12) err.mobile = 'Enter a valid mobile number.';
    if (form.message.trim().length < 5) err.message = 'Please enter your message.';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const msg = [
      // SEO Updated WhatsApp Message Header
      '*AT Brand Sargodha — Contact Message*',
      '------------------------------',
      `*Name:* ${form.name.trim()}`,
      `*Mobile:* ${form.mobile.trim()}`,
      '------------------------------',
      form.message.trim(),
    ].join('\n');
    openWhatsApp(msg);
    toast.success('Opening WhatsApp with your message…');
    setForm(EMPTY);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO Updated Meta Tags */}
      <Helmet>
        <title>Contact AT Brand Sargodha | Mens Premium Unstitched Suits</title>
        <meta
          name="description"
          content="Contact AT Brand Sargodha in Pakistan. WhatsApp hotline +92 310 6017983, email atbrand00@gmail.com, or visit our store for mens premium unstitched suits and shalwar kameez."
        />
      </Helmet>

      <Header />
      <main className="pt-16">
        <section className="border-b border-border/60 bg-secondary/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                <span className="h-px w-10 bg-accent" />
                AT Brand Sargodha Support
              </p>
              {/* SEO Updated Heading */}
              <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">Contact Us</h1>
              {/* SEO Updated Paragraph */}
              <p className="mt-4 max-w-xl text-muted-foreground">
                Questions about our mens premium unstitched suits, sizing, or your order? We're here to help — reach us
                on WhatsApp or email, or visit our Sargodha store for help with product details, sizing, stitching or an order.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            {/* Contact details */}
            <Reveal>
              <div className="space-y-6">
                <button
                  onClick={() => openWhatsApp('Assalam-o-Alaikum! I would like to place an order for a premium unstitched suit.')}
                  className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">WhatsApp Hotline</p>
                    <p className="mt-1 font-display text-lg text-foreground">{WHATSAPP_NUMBER_DISPLAY}</p>
                    <p className="text-sm text-muted-foreground">Tap to chat & order instantly</p>
                  </div>
                </button>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Support Email</p>
                    <p className="mt-1 font-display text-lg text-foreground">{SUPPORT_EMAIL}</p>
                    <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                  </div>
                </a>

                <div className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Store Location</p>
                    <p className="mt-1 font-display text-lg text-foreground">{STORE_LOCATION}</p>
                  </div>
                </div>

                <div className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Store Hours</p>
                    <p className="mt-1 font-display text-lg text-foreground">Mon – Sat, 10am – 9pm</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Contact form */}
            <Reveal delay={0.1}>
              <form
                onSubmit={submit}
                noValidate
                className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
              >
                <h2 className="font-display text-2xl text-foreground">Send us a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your message opens as a pre-filled WhatsApp chat.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="e.g. Muhammad Ahmed Khan"
                      value={form.name}
                      onChange={set('name')}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-mobile">Mobile Number</Label>
                    <Input
                      id="contact-mobile"
                      type="tel"
                      placeholder="e.g. 0300 1234567"
                      value={form.mobile}
                      onChange={set('mobile')}
                    />
                    {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      rows={4}
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={set('message')}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    Send via WhatsApp
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
