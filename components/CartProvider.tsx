'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  variant: string | null;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void;
  updateQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'rotirumah-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignore malformed local storage data and start with an empty cart.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage failures; cart still works for the current session.
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue['addItem'] = (item, qty = 1) => {
      const safeQty = Math.max(1, Math.floor(qty));
      const key = `${item.slug}::${item.variant ?? 'default'}`;
      setItems((current) => {
        const existing = current.find((entry) => entry.key === key);
        if (existing) {
          return current.map((entry) =>
            entry.key === key ? { ...entry, qty: entry.qty + safeQty } : entry,
          );
        }
        return [...current, { ...item, key, qty: safeQty }];
      });
    };

    const updateQuantity = (key: string, qty: number) => {
      const safeQty = Math.floor(qty);
      setItems((current) =>
        safeQty <= 0
          ? current.filter((entry) => entry.key !== key)
          : current.map((entry) => (entry.key === key ? { ...entry, qty: safeQty } : entry)),
      );
    };

    const removeItem = (key: string) => {
      setItems((current) => current.filter((entry) => entry.key !== key));
    };

    const clearCart = () => setItems([]);

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart harus digunakan di dalam CartProvider');
  return value;
}
