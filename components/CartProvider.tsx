'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { buildCartKey, createCartItem, type CartItem, type CartItemInput } from '@/lib/cart';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  addItem: (item: CartItemInput) => boolean;
  removeItem: (item: CartItemInput) => void;
  clearCart: () => void;
  hasItem: (item: CartItemInput) => boolean;
}

const CART_STORAGE_KEY = 'deshicourse.cart.v1';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!storedValue) {
        setIsReady(true);
        return;
      }

      const parsedValue = JSON.parse(storedValue) as CartItem[];

      if (Array.isArray(parsedValue)) {
        setItems(parsedValue);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  function addItem(item: CartItemInput) {
    const key = buildCartKey(item.type, item.slug);

    if (items.some((currentItem) => currentItem.key === key)) {
      return false;
    }

    setItems((currentItems) => {
      return [...currentItems, createCartItem(item)];
    });

    return true;
  }

  function removeItem(item: CartItemInput) {
    const key = buildCartKey(item.type, item.slug);
    setItems((currentItems) => currentItems.filter((currentItem) => currentItem.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  function hasItem(item: CartItemInput) {
    const key = buildCartKey(item.type, item.slug);
    return items.some((currentItem) => currentItem.key === key);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        isReady,
        addItem,
        removeItem,
        clearCart,
        hasItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
}
