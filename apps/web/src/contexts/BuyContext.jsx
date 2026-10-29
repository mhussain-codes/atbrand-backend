import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BuyNowDialog from '@/components/BuyNowDialog';
import { toast } from 'sonner';

const BuyContext = createContext(null);

export function BuyProvider({ children }) {
  const [buyProduct, setBuyProduct] = useState(null);
  
  // Persistent Cart via localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('atbrand_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('atbrand_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const openBuy = useCallback((product) => setBuyProduct(product), []);
  const closeBuy = useCallback(() => setBuyProduct(null), []);

  const openCartCheckout = useCallback(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartNames = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    setBuyProduct({
      id: 'CART-' + Date.now(),
      isCartOrder: true,
      cartItems: cart,
      name: `Cart Checkout (${totalItems} items)`,
      fabric: cartNames.length > 50 ? cartNames.substring(0, 50) + '...' : cartNames,
      price: totalPrice,
      image: cart[0]?.images?.[0] || cart[0]?.image || ''
    });

    setIsCartOpen(false);
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.selectedColor === product.selectedColor);
      if (existingItem) {
        toast.success(`Updated quantity for ${product.name}`);
        return prevCart.map((item) =>
          item.id === product.id && item.selectedColor === product.selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Added ${product.name} to cart`);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId, selectedColor) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.selectedColor === selectedColor)));
    toast.info('Item removed from cart');
  }, []);

  const updateQuantity = useCallback((productId, delta, selectedColor) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.id === productId && (!selectedColor || item.selectedColor === selectedColor)) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('atbrand_cart');
  }, []);

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
