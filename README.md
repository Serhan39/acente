# Acente — Mobil Muhasebe Yazılımı

Telefondan kullanılabilen, işletme/serbest meslek muhasebesi için geliştirilmiş uçtan uca bir sistem.

## Proje Yapısı

```
acente/
├── backend/   # Node.js + TypeScript + Express + PostgreSQL (Prisma) REST API
└── mobile/    # React Native (Expo) mobil uygulama
```

## Özellikler

- **Gelir/Gider Takibi** — kategori bazlı, kasa/banka hesabına bağlı, cari hesapla ilişkilendirilebilir işlemler
- **Kasa/Banka Yönetimi** — birden fazla nakit/banka hesabı, hesaplar arası transfer
- **Cari Hesap (Müşteri/Tedarikçi)** — bakiye takibi, hesap ekstresi (fatura + tahsilat/ödeme geçmişi)
- **Faturalama** — satış/alış faturası, çoklu kalem, otomatik KDV hesaplama, kısmi/tam tahsilat, iptal
- **Fişten Otomatik İşlem** — fiş/fatura fotoğrafı çekilir, Claude (Anthropic API) tutar/tarih/kategori bilgilerini otomatik çıkarır, kullanıcı onaylayınca işlem kaydedilir
- **Dashboard** — net değer, aylık gelir/gider grafiği, açık faturalar, son işlemler
- **Kimlik Doğrulama** — JWT tabanlı kayıt/giriş, güvenli token saklama (SecureStore)

## Hızlı Başlangıç

### 1. Backend

```bash
cd backend
cp .env.example .env      # DATABASE_URL ve JWT_SECRET değerlerini düzenleyin
npm install
npm run prisma:migrate    # veritabanı şemasını oluşturur
npm run seed               # (opsiyonel) demo@acente.app / demo1234 ile demo veri
npm run dev                 # http://localhost:4000
```

PostgreSQL'e ihtiyacınız var. Docker ile hızlıca ayağa kaldırmak için:

```bash
docker run --name acente-db -e POSTGRES_USER=acente -e POSTGRES_PASSWORD=acente -e POSTGRES_DB=acente -p 5432:5432 -d postgres:16
```

### 2. Mobil Uygulama

```bash
cd mobile
cp .env.example .env      # EXPO_PUBLIC_API_URL'i bilgisayarınızın yerel IP'sine göre ayarlayın
npm install
npm run start
```

Ardından Expo Go uygulamasıyla QR kodu okutarak telefonunuzdan açabilirsiniz. **Önemli:** Fiziksel telefondan bağlanırken `localhost` çalışmaz — `.env` dosyasındaki `EXPO_PUBLIC_API_URL` değerini bilgisayarınızın yerel ağ IP adresine göre ayarlayın (örn. `http://192.168.1.20:4000/api`), telefon ve bilgisayar aynı Wi-Fi ağında olmalı.

## Teknoloji Seçimleri

| Katman | Teknoloji |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, Zod |
| Mobil | React Native (Expo), TypeScript, React Navigation, react-native-svg |

Detaylı kurulum ve API bilgisi için `backend/README.md` ve `mobile/README.md` dosyalarına bakabilirsiniz.
