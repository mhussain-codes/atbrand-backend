import React, { createContext, useContext, useState, useCallback } from 'react';
import BuyNowDialog from '@/components/BuyNowDialog';
import { toast } from 'sonner';

const BuyContext = createContext(null);

export function BuyProvider({ children }) {
  const [buyProduct, setBuyProduct] = useState(null);
  const [cart, setCart] = useState([]);

  // Cart Drawer ko Left side se open/close karne ke liye state
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openBuy = useCallback((product) => setBuyProduct(product), []);
  const closeBuy = useCallback(() => setBuyProduct(null), []);

  // NEW: Cart ke items ko form mein bhejne ke liye function
  const openCartCheckout = useCallback(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartNames = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    // Poore cart ko as a single "Product" form ko bhej rahe hain
    setBuyProduct({
      id: 'CART-' + Date.now(),
      isCartOrder: true,
      cartItems: cart,
      name: `Cart Checkout (${totalItems} items)`,
      fabric: cartNames.length > 50 ? cartNames.substring(0, 50) + '...' : cartNames,
      price: totalPrice,
      // FIX: Updated to support new 'images' array format along with fallback
      image: cart[0]?.images?.[0] || cart[0]?.image || '' 
    });

    setIsCartOpen(false); // Drawer close kar dega
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <BuyContext.Provider value={{
      openBuy,
      openCartCheckout,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
      <BuyNowDialog
        product={buyProduct}
        open={Boolean(buyProduct)}
        onOpenChange={(o) => {
          if (!o) closeBuy();
        }}
      />
    </BuyContext.Provider>
  );
}

export const useBuy = () => {
  const ctx = useContext(BuyContext);
  if (!ctx) throw new Error('useBuy must be used within BuyProvider');
  return ctx;
};

export default BuyContext;