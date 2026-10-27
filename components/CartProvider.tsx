'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { site } from '@/lib/content/site';

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  variant: string | null;
  price: number;
  image: string;
  qty: number;
  /** 'product' | 'bundle' — dipakai saat menyusun pesan */
  kind: 'product' | 'bundle';
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; item: Omit<CartItem, 'key' | 'qty'>; qty: number }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

const STORAGE_KEY = 'rotirumah-cart-v2';
const LEGACY_KEY = 'rotirumah-cart-v1';

const clampQty = (qty: number) =>
  Math.max(1, Math.min(site.limits.maxQtyPerItem, Math.floor(qty)));

const keyOf = (item: { slug: string; variant: string | null }) =>
  `${item.slug}::${item.variant ?? 'default'}`;

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items, hydrated: true };

    case 'add': {
      const key = keyOf(action.item);
      const existing = state.items.find((entry) => entry.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((entry) =>
            entry.key === key ? { ...entry, qty: clampQty(entry.qty + action.qty) } : entry,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, key, qty: clampQty(action.qty) }],
      };
    }

    case 'setQty':
      return {
        ...state,
        items: state.items.map((entry) =>
          entry.key === action.key ? { ...entry, qty: clampQty(action.qty) } : entry,
        ),
      };

    case 'remove':
      return { ...state, items: state.items.filter((entry) => entry.key !== action.key) };

    case 'clear':
      return { ...state, items: [] };

    default:
      return state;
  }
}

function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is CartItem => {
      return (
        !!entry &&
        typeof entry === 'object' &&
        typeof (entry as CartItem).slug === 'string' &&
        typeof (entry as CartItem).name === 'string' &&
        typeof (entry as CartItem).price === 'number' &&
        typeof (entry as CartItem).qty === 'number'
      );
    })
    .map((entry) => ({
      key: entry.key ?? keyOf(entry),
      slug: entry.slug,
      name: entry.name,
      variant: entry.variant ?? null,
      price: entry.price,
      image: entry.image ?? 'roti-sobek',
      qty: clampQty(entry.qty),
      kind: entry.kind === 'bundle' ? ('bundle' as const) : ('product' as const),
    }))
    .slice(0, 40);
}

function readStorage(): CartItem[] {
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as { items?: unknown };
      return sanitize(parsed.items);
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) return sanitize(JSON.parse(legacy));
  } catch {
    // localStorage rusak/diblokir: mulai dari keranjang kosong.
  }
  return [];
}

/* State dan actions dipisah supaya komponen yang hanya menambah item
   tidak ikut re-render setiap qty berubah. */
const CartStateContext = createContext<CartState | null>(null);
const CartActionsContext = createContext<{
  addItem: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void;
  setQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const skipPersist = useRef(true);

  // Baca localStorage setelah mount; `hydrated` mencegah flash "keranjang kosong".
  useEffect(() => {
    dispatch({ type: 'hydrate', items: readStorage() });
  }, []);

  // Tulis perubahan (kecuali hasil hidrasi awal).
  useEffect(() => {
    if (!state.hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, items: state.items }));
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // Kuota penuh / mode privat: keranjang tetap jalan untuk sesi ini.
    }
  }, [state.items, state.hydrated]);

  // Sinkron antar-tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: 'hydrate', items: readStorage() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const actions = useMemo(
    () => ({
      addItem: (item: Omit<CartItem, 'key' | 'qty'>, qty = 1) =>
        dispatch({ type: 'add', item, qty }),
      setQuantity: (key: string, qty: number) => dispatch({ type: 'setQty', key, qty }),
      removeItem: (key: string) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [],
  );

  return (
    <CartStateContext.Provider value={state}>
      <CartActionsContext.Provider value={actions}>{children}</CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  const value = useContext(CartStateContext);
  if (!value) throw new Error('useCartState harus dipakai di dalam CartProvider');
  return value;
}

export function useCartActions() {
  const value = useContext(CartActionsContext);
  if (!value) throw new Error('useCartActions harus dipakai di dalam CartProvider');
  return value;
}

/** Ringkasan turunan (jumlah item & subtotal) — dihitung sekali per perubahan. */
export function useCartSummary() {
  const { items, hydrated } = useCartState();
  return useMemo(
    () => ({
      items,
      hydrated,
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      isEmpty: items.length === 0,
    }),
    [items, hydrated],
  );
}
