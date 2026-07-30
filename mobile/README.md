# Acente Mobil Uygulama

React Native (Expo) ile geliştirilmiş, telefondan kullanılan muhasebe uygulaması.

## Kurulum

```bash
cp .env.example .env   # EXPO_PUBLIC_API_URL'i ayarlayın
npm install
npm run start
```

Açılan QR kodu **Expo Go** uygulamasıyla (App Store / Play Store) okutarak telefonunuzdan test edebilirsiniz. Bilgisayarınız ve telefonunuz aynı Wi-Fi ağında olmalı.

`npm run android` / `npm run ios` ile emülatör/simülatörde de çalıştırabilirsiniz.

## Backend Bağlantısı

`.env` dosyasındaki `EXPO_PUBLIC_API_URL` değişkeni backend API adresini belirler:

- Emülatör (Android Studio) üzerinden test: `http://10.0.2.2:4000/api`
- iOS simülatör: `http://localhost:4000/api`
- **Fiziksel telefon:** bilgisayarınızın yerel ağ IP'si, örn. `http://192.168.1.20:4000/api`

## Klasör Yapısı

```
src/
├── api/          # Backend REST çağrıları (axios)
├── components/   # Yeniden kullanılabilir UI bileşenleri
├── context/       # Auth context (oturum yönetimi)
├── navigation/    # React Navigation stack/tab yapılandırması
├── screens/       # Ekranlar (dashboard, transactions, accounts, invoices, settings, auth)
├── theme/         # Renk, tipografi, spacing sabitleri
├── types/         # Backend modelleriyle eşleşen TypeScript tipleri
└── utils/         # Para/tarih formatlama yardımcıları
```

## Gerçek Cihaza Kurulum (App Store / Play Store)

Bu proje şu an Expo Go ile test amaçlı çalışacak şekilde kuruldu. Gerçek bir uygulama olarak mağazalara yüklemek için [EAS Build](https://docs.expo.dev/build/introduction/) kullanılması gerekir — istenirse ayrı bir adım olarak eklenebilir.
