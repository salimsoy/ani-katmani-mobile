import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/utils/api';
import { getLocalCart } from '@/utils/cart';

interface CartContextType {
  itemCount: number;
  setItemCount: (count: number) => void;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  // Sunucudan (üye) ya da localStorage'dan (misafir) toplam adedi yeniden hesaplar.
  // Doğrudan ekranda zaten elimizde güncel sepet verisi varsa setItemCount'u
  // direkt çağırmak (fetch atmadan) daha verimli — bunu cart.tsx'te öyle kullanacağız.
  const refreshCartCount = useCallback(async () => {
    const token = await SecureStore.getItemAsync('token');

    if (!token) {
      const localCart = await getLocalCart();
      const total = localCart.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(total);
      return;
    }

    try {
      const res = await apiFetch('/cart');
      const data = await res.json();
      const total = Array.isArray(data)
        ? data.reduce((sum: number, item: any) => sum + item.quantity, 0)
        : 0;
      setItemCount(total);
    } catch {
      // Sessizce yut — rozet güncellenmeyebilir ama uygulama çökmez
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ itemCount, setItemCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart, CartProvider içinde kullanılmalı');
  return context;
}