import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductColor } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, color?: ProductColor, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'alassal_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, size?: string, color?: ProductColor, quantity = 1) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'مقاس قياسي';
    const selectedColor = color || (product.colors && product.colors[0]) || { name: 'افتراضي', hex: '#E2E8F0' };
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor.name}`;

    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === cartItemId);
      if (existing) {
        return prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxStock || 99) }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0] || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
          size: selectedSize,
          color: selectedColor,
          quantity,
          maxStock: product.stock || 20,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: Math.min(quantity, item.maxStock || 99) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
