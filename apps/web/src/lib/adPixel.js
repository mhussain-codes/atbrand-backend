/**
 * Meta (Facebook) & TikTok Pixel Tracking Helper
 * Tracks standard e-commerce events for paid traffic campaigns (Facebook / Instagram / TikTok)
 * Safe fallback: Never throws runtime errors if pixel IDs are not yet loaded.
 */

export const getMetaPixelId = () => {
  return (typeof window !== 'undefined' && window.META_PIXEL_ID) || '';
};

export const getTikTokPixelId = () => {
  return (typeof window !== 'undefined' && window.TIKTOK_PIXEL_ID) || '';
};

export function trackPixelEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  // 1. Meta (Facebook) Pixel
  if (typeof window.fbq === 'function') {
    try {
      if (['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase', 'Contact', 'Lead'].includes(eventName)) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('trackCustom', eventName, params);
      }
    } catch (e) {
      console.warn('Meta Pixel tracking error:', e);
    }
  }

  // 2. TikTok Pixel
  if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
    try {
      // Map event names to TikTok standard events
      const ttEventMap = {
        'PageView': 'PageView',
        'ViewContent': 'ViewContent',
        'AddToCart': 'AddToCart',
        'InitiateCheckout': 'InitiateCheckout',
        'Purchase': 'CompletePayment',
        'Contact': 'Contact',
        'Lead': 'SubmitForm'
      };
      const ttEvent = ttEventMap[eventName] || eventName;
      window.ttq.track(ttEvent, params);
    } catch (e) {
      console.warn('TikTok Pixel tracking error:', e);
    }
  }
}

export function trackViewContent(product) {
  if (!product) return;
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_id: String(product.id),
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: 'PKR'
  });
}

export function trackAddToCart(product) {
  if (!product) return;
  trackPixelEvent('AddToCart', {
    content_name: product.name,
    content_id: String(product.id),
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: 'PKR'
  });
}

export function trackInitiateCheckout(items = [], total = 0) {
  trackPixelEvent('InitiateCheckout', {
    num_items: items.length,
    value: total,
    currency: 'PKR'
  });
}

export function trackPurchase(orderData = {}) {
  trackPixelEvent('Purchase', {
    order_id: orderData.orderId || orderData.id,
    value: orderData.total || 0,
    currency: 'PKR',
    content_type: 'product'
  });
}

export function trackWhatsAppClick(source = 'general') {
  trackPixelEvent('Contact', {
    channel: 'WhatsApp',
    source: source
  });
}
