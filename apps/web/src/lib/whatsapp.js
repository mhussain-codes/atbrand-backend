// Business WhatsApp number in international format (no +, no spaces).
export const WHATSAPP_NUMBER = '923106017983';
export const WHATSAPP_NUMBER_DISPLAY = '+92 310 6017983';
export const SUPPORT_EMAIL = 'atbrand00@gmail.com';
export const STORE_LOCATION = 'New Satellite Town, Tali Chowk X-Block, Sargodha, Pakistan';

export const formatPKR = (n) => `PKR ${Number(n).toLocaleString('en-PK')}`;

// Professionally formatted order message sent when the Buy Now form is submitted (Single Item).
export function buildOrderMessage({ product, name, mobile, address, orderId }) {
  // Agar color select hua hai toh colorText banaye ga, warna empty rahega
  const colorText = product.selectedColor ? ` (Color: ${product.selectedColor})` : '';

  return [
    '*NEW ORDER — AT BRAND*',
    '------------------------------',
    `*Order ID:* ${orderId}`,
    `*Product:* ${product.name}${colorText} (${product.type})`, // Color yahan add ho gaya
    `*Price:* ${formatPKR(product.price)}`,
    '------------------------------',
    `*Name:* ${name.trim()}`,
    `*Mobile:* ${mobile.trim()}`,
    `*Address:* ${address.trim()}`,
    '------------------------------',
    'Please confirm my order and share delivery details. Shukriya!',
  ].join('\n');
}

// NEW: Professionally formatted order message for Multiple Cart Items
export function buildCartMessage(cart) {
  // Total calculate karna
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let message = [
    '*NEW CART ORDER — AT BRAND*',
    '------------------------------'
  ];

  // Har item ko list mein add karna
  cart.forEach((item, index) => {
    // Cart mein bhi har item ka color check karega
    const colorText = item.selectedColor ? ` (Color: ${item.selectedColor})` : '';

    message.push(`${index + 1}. *${item.name}*${colorText} (${item.type})`);
    message.push(`   Qty: ${item.quantity} x ${formatPKR(item.price)}`);
  });

  message.push('------------------------------');
  message.push(`*Total Amount:* ${formatPKR(total)}`);
  message.push('------------------------------');
  message.push('I would like to place this order. Please guide me with the next steps. Shukriya!');

  return message.join('\n');
}

// Quick one-tap enquiry message from a product card.
export function buildInquiryMessage(product) {
  const colorText = product.selectedColor ? ` (Color: ${product.selectedColor})` : '';

  return `Assalam-o-Alaikum! I'm interested in the *${product.name}*${colorText} (${product.type}) — ${formatPKR(
    product.price
  )}. Is it available?`;
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}