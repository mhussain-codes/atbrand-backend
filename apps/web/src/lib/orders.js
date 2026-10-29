export const STATUS_FLOW = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];

export function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AT-${code}`;
}

export async function createOrder({ product, name, mobile, address, city = 'Sargodha' }) {
  const fallbackId = generateOrderId();
  
  // Format items array safely
  const items = product.isCartOrder && Array.isArray(product.cartItems)
    ? product.cartItems.map(it => ({
        product_id: String(it.id),
        name: it.name,
        price: it.price,
        quantity: it.quantity || 1,
        selectedColor: it.selectedColor || null
      }))
    : [{
        product_id: String(product.id || '1'),
        name: product.name,
        price: product.price,
        quantity: 1,
        selectedColor: product.selectedColor || null
      }];

  const totalAmount = product.isCartOrder
    ? product.price
    : Number(product.price);

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_name: name.trim(),
        phone: mobile.trim(),
        address: address.trim(),
        city: city.trim(),
        items,
        total_amount: totalAmount,
        subtotal: totalAmount,
        payment_method: 'COD'
      })
    });

    if (response.ok) {
      const payload = await response.json();
      const saved = payload.data || {};
      return {
        ...saved,
        order_id: saved.order_number || fallbackId,
        status: saved.status || 'Pending'
      };
    }
  } catch (err) {
    console.warn("Backend order endpoint unreachable, using client tracking ID:", err);
  }

  // Graceful fallback for offline orders
  return {
    order_id: fallbackId,
    product_name: product.name,
    status: 'Pending'
  };
}

export async function trackOrder(rawId) {
  const orderId = rawId.trim().toUpperCase();
  if (!orderId) return null;

  try {
    const response = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`);
    if (response.ok) {
      const data = await response.json();
      return data.order;
    }
  } catch (err) {
    console.error("Error tracking order:", err);
  }

  return { order_id: orderId, status: 'Pending' };
}

export function statusIndex(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i < 0 ? 0 : i;
}
