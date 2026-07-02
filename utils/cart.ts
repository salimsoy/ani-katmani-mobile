import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'local_cart';

export type LocalCartItem = {
  figurineId: number;
  quantity: number;
  figurine: {
    id: number;
    name: string;
    price: number;
    filamentType: string;
    scale: string;
    imageUrl: string;
  };
};

// Sepeti getir
export async function getLocalCart(): Promise<LocalCartItem[]> {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Sepete ürün ekle
export async function addToLocalCart(item: LocalCartItem): Promise<void> {
  const cart = await getLocalCart();
  const existing = cart.find(c => c.figurineId === item.figurineId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Adet güncelle
export async function updateLocalCartItem(figurineId: number, newQuantity: number): Promise<void> {
  const cart = await getLocalCart();
  if (newQuantity <= 0) {
    await removeFromLocalCart(figurineId);
    return;
  }
  const item = cart.find(c => c.figurineId === figurineId);
  if (item) {
    item.quantity = newQuantity;
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

// Ürün sil
export async function removeFromLocalCart(figurineId: number): Promise<void> {
  const cart = await getLocalCart();
  const filtered = cart.filter(c => c.figurineId !== figurineId);
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(filtered));
}

// Sepeti temizle
export async function clearLocalCart(): Promise<void> {
  await AsyncStorage.removeItem(CART_KEY);
}