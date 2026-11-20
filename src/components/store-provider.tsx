'use client';
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { CartLine } from '@/types/commerce';
import { browserClient } from '@/lib/supabase/client';
type Store = {
  lines: CartLine[];
  wishlist: string[];
  add: (line: CartLine) => void;
  quantity: (sku: string, n: number) => void;
  clear: () => void;
  toggleWish: (sku: string) => void;
  notify: (text: string) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children, demo = false }: { children: ReactNode; demo?: boolean }) {
  const bagKey = demo ? 'ss-demo-bag' : 'ss-bag';
  const wishlistKey = demo ? 'ss-demo-wishlist' : 'ss-wishlist';
  const ownerKey = demo ? 'ss-demo-bag-owner' : 'ss-bag-owner';
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [syncedUser, setSyncedUser] = useState<string | null>(null);
  const activeUser = useRef<string | null>(null);
  useEffect(() => {
    try {
      if (localStorage.getItem(ownerKey)) {
        setReady(true);
        return;
      }
      const l = JSON.parse(localStorage.getItem(bagKey) || '[]');
      if (Array.isArray(l))
        setLines(
          l.filter(
            (x) =>
              typeof x.sku === 'string' &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 10,
          ),
        );
      const w = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      if (Array.isArray(w)) setWishlist(w.filter((x) => typeof x === 'string'));
    } catch {}
    setReady(true);
  }, [bagKey, wishlistKey, ownerKey]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(bagKey, JSON.stringify(lines));
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    if (activeUser.current) localStorage.setItem(ownerKey, activeUser.current);
    else localStorage.removeItem(ownerKey);
  }, [lines, wishlist, ready, syncedUser, bagKey, wishlistKey, ownerKey]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (demo || !ready || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const db = browserClient();
    let alive = true;
    const channel = db.auth.onAuthStateChange((event, session) => {
      const next = session?.user.id || null;
      if (event === 'SIGNED_OUT') {
        activeUser.current = null;
        setSyncedUser(null);
        setLines([]);
        setWishlist([]);
        return;
      }
      if (next === activeUser.current) return;
      activeUser.current = next;
      setSyncedUser(null);
      if (next)
        setTimeout(async () => {
          const [cart, wishes] = await Promise.all([
            db.from('saved_carts').select('items').eq('user_id', next).maybeSingle(),
            db.from('wishlist').select('external_sku').eq('user_id', next),
          ]);
          if (!alive || activeUser.current !== next) return;
          if (cart.error || wishes.error) {
            setToast('Saved items could not be loaded. Please refresh.');
            return;
          }
          if (cart.data?.items && Array.isArray(cart.data.items))
            setLines(cart.data.items as CartLine[]);
          else if (event !== 'INITIAL_SESSION') setLines([]);
          setWishlist((wishes.data || []).map((x) => x.external_sku));
          setSyncedUser(next);
        }, 0);
    });
    return () => {
      alive = false;
      channel.data.subscription.unsubscribe();
    };
  }, [ready, demo]);
  useEffect(() => {
    if (demo || !ready || !syncedUser) return;
    const timer = setTimeout(async () => {
      try {
        if (activeUser.current !== syncedUser) return;
        const db = browserClient();
        const { error } = await db
          .from('saved_carts')
          .upsert({ user_id: syncedUser, items: lines, updated_at: new Date().toISOString() });
        if (error) setToast('Bag is saved on this device. Account sync is unavailable.');
      } catch {}
    }, 700);
    return () => clearTimeout(timer);
  }, [lines, ready, syncedUser, demo]);
  function toggleWish(sku: string) {
    setWishlist((v) => (v.includes(sku) ? v.filter((x) => x !== sku) : [...v, sku]));
    if (!demo && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const db = browserClient();
      void db.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        if (wishlist.includes(sku))
          await db.from('wishlist').delete().eq('user_id', user.id).eq('external_sku', sku);
        else
          await db
            .from('wishlist')
            .upsert(
              { user_id: user.id, external_sku: sku },
              { onConflict: 'user_id,external_sku' },
            );
      });
    }
  }
  return (
    <Context.Provider
      value={{
        lines,
        wishlist,
        notify: setToast,
        add: (line) => {
          setLines((v) => {
            const old = v.find((x) => x.sku === line.sku);
            return old
              ? v.map((x) =>
                  x.sku === line.sku
                    ? { ...x, quantity: Math.min(10, x.quantity + line.quantity) }
                    : x,
                )
              : [...v, line];
          });
          setToast('Added to your bag.');
        },
        quantity: (sku, n) =>
          setLines((v) =>
            n <= 0
              ? v.filter((x) => x.sku !== sku)
              : v.map((x) => (x.sku === sku ? { ...x, quantity: Math.min(10, n) } : x)),
          ),
        clear: () => setLines([]),
        toggleWish,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('Store provider missing');
  return store;
}
