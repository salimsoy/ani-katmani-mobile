# Anı Katmanı 3D — Mobil Uygulama

3D baskı figürin e-ticaret uygulaması. React Native (Expo) ile geliştirildi, [backend API](https://github.com/salimsoy/ani-katmani-backend) ile çalışır.

## Teknolojiler

- **React Native (Expo)** — Expo Router ile dosya tabanlı routing
- **TypeScript**
- **expo-secure-store** — JWT token güvenli saklama
- **AsyncStorage** — misafir sepeti (local cart)

## Özellikler

- **Kimlik doğrulama:** Kayıt, giriş, çıkış — JWT tabanlı
- **Misafir modu:** Login olmadan gezinme ve sepete ekleme (local storage), login olunca sepet otomatik senkronize edilir
- **Ürün listeleme:** Arama, filament tipine göre filtreleme, 2 sütunlu grid görünüm
- **Ürün detayı:** Adet seçici, favori ekleme, sabit alt "Sepete Ekle" barı
- **Sepet:** Adet güncelleme, ürün silme, sipariş özeti
- **Checkout:** Ayrı teslimat bilgileri sayfası
- **Sipariş geçmişi:** Durum takibi (Beklemede / Hazırlanıyor / Kargoda / Teslim Edildi)
- **Favoriler:** Ürünleri favorilere ekleme/çıkarma
- **Admin paneli:** Ürün ekleme/düzenleme/silme, sipariş durumu yönetimi (rol tabanlı erişim)

## Ekran Yapısı

app/
├── (tabs)/
│   ├── index.tsx      — ana sayfa, ürün listesi
│   ├── cart.tsx        — sepet
│   └── profile.tsx     — profil, menü
├── [id].tsx             — ürün detayı
├── login.tsx / register.tsx
├── checkout.tsx         — teslimat bilgileri
├── orders.tsx            — sipariş geçmişi
├── favorites.tsx         — favori ürünler
├── admin.tsx              — ürün yönetimi
└── admin-orders.tsx       — sipariş yönetimi

## Kurulum

```bash
npm install

# Backend URL'ini utils/api.ts içinde güncelle
# const BASE_URL = 'http://<kendi-ip-adresin>:5059';

npx expo start --lan
```

## Mimari Notları

- Tüm API istekleri `utils/api.ts` içindeki `apiFetch` fonksiyonu üzerinden geçer — token varsa otomatik `Authorization` header'ı eklenir
- Misafir sepeti `utils/cart.ts` ile AsyncStorage'da tutulur, login olunca backend'e merge edilir
- Rol tabanlı erişim: admin ekranları backend'den dönen `isAdmin` bilgisine göre koşullu render edilir