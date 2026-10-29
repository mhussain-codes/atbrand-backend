const STATUS_FLOW = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];

export function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AT-${code}`;
}

export async function createOrder({ product, name, mobile, address }) {
  const orderId = generateOrderId();
  const idempotencyKey = crypto.randomUUID();
  
  try {
    // Seedha aapke Vercel backend aur Supabase database ko order bhejna
    const response = await fetch('https://atbrand-backend.vercel.app/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        customer_name: name.trim(),
        phone: mobile.trim(),
        address: address.trim(),
        items: [
          {
            product_id: String(product.id || '1'),
            quantity: 1
          }
        ]
      })
    });

    if (response.ok) {
      const payload = await response.json();
      const saved = payload.data || {};
      return {
        ...saved,
        order_id: saved.order_number || orderId,
        status: saved.status || 'Pending'
      };
    } else {
      const errData = await response.json();
      console.error("Backend order error:", errData);
    }
  } catch (err) {
    console.error("Network error saving order to database:", err);
  }

  // Fallback taake WhatsApp aur Google Sheet par order mein koi rukawat na aaye
  return {
    order_id: orderId,
    product_name: product.name,
    status: 'Pending'
  };
}

export async function trackOrder(rawId) {
  const orderId = rawId.trim().toUpperCase();
  if (!orderId) return null;
  return { order_id: orderId, status: 'Pending' };
}

export function statusIndex(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i < 0 ? 0 : i;
}

export { STATUS_FLOW };