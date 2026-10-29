import React, { createContext, useContext, useState, useCallback } from 'react';
import BuyNowDialog from '@/components/BuyNowDialog';

const BuyContext = createContext(null);

export function BuyProvider({ children }) {
  const [buyProduct, setBuyProduct] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Cart Drawer ko Left side se open/close karne ke liye state
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openBuy = useCallback((product) => setBuyProduct(product), []);
  const closeBuy = useCallback(() => setBuyProduct(null), []);

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
    // YAHAN SE setIsCartOpen(true) HATA DIYA HAI. Ab direct open nahi hoga.
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