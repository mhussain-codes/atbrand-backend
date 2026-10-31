// Business WhatsApp number in international format (no +, no spaces).
export const WHATSAPP_NUMBER = '923106017983';
export const WHATSAPP_NUMBER_DISPLAY = '+92 310 6017983';
export const SUPPORT_EMAIL = 'atbrand00@gmail.com';
export const STORE_LOCATION = 'New Satellite Town, Tali Chowk X-Block, Sargodha, Pakistan';
export const DELIVERY_FEE = 200;

export const formatPKR = (n) => `PKR ${Number(n).toLocaleString('en-PK')}`;

// Professionally formatted order message sent when the Buy Now form is submitted (Single Item).
export function buildOrderMessage({ product, name, mobile, address, orderId }) {
  const colorText = product.selectedColor ? ` (Color: ${product.selectedColor})` : '';
  const subtotal = Number(product.price) || 0;
  const total = subtotal + DELIVERY_FEE;

  return [
    '*NEW ORDER — AT BRAND*',
    '------------------------------',
    `*Order ID:* ${orderId}`,
    `*Product:* ${product.name}${colorText} (${product.type || 'Suit'})`,
    `*Suit Price:* ${formatPKR(subtotal)}`,
    `*Delivery (Pakistan Post):* ${formatPKR(DELIVERY_FEE)}`,
    `*Total Payable (COD):* ${formatPKR(total)}`,
    '------------------------------',
    `*Payment:* Cash on Delivery (Open Parcel available)`,
    `*Delivery Time:* 3 to 4 working days`,
    '------------------------------',
    `*Name:* ${name.trim()}`,
    `*Mobile:* ${mobile.trim()}`,
    `*Address:* ${address.trim()}`,
    '------------------------------',
    'Please confirm parcel dispatch via Pakistan Post. Shukriya!',
  ].join('\n');
}

// NEW: Professionally formatted order message for Multiple Cart Items
export function buildCartMessage(cart) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE;

  let message = [
    '*NEW CART ORDER — AT BRAND*',
    '------------------------------'
  ];

  cart.forEach((item, index) => {
    const colorText = item.selectedColor ? ` (Color: ${item.selectedColor})` : '';
    message.push(`${index + 1}. *${item.name}*${colorText} (${item.type || 'Suit'})`);
    message.push(`   Qty: ${item.quantity} x ${formatPKR(item.price)}`);
  });

  message.push('------------------------------');
  message.push(`*Subtotal:* ${formatPKR(subtotal)}`);
  message.push(`*Delivery (Pakistan Post):* ${formatPKR(DELIVERY_FEE)}`);
  message.push(`*Total Payable (COD):* ${formatPKR(total)}`);
  message.push('------------------------------');
  message.push('*Payment:* Cash on Delivery (Open Parcel inspection available)');
  message.push('*Delivery Time:* 3 to 4 working days');
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