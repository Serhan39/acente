# Acente Backend

Node.js + TypeScript + Express + Prisma (PostgreSQL) REST API.

## Kurulum

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate   # geliştirme ortamında migration oluşturur/uygular
npm run seed              # opsiyonel demo veri (demo@acente.app / demo1234)
npm run dev
```

API varsayılan olarak `http://localhost:4000` adresinde çalışır, tüm uçlar `/api` altındadır.

## Ortam Değişkenleri (`.env`)

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı adresi |
| `JWT_SECRET` | Token imzalama anahtarı (üretimde uzun/rastgele bir değer kullanın) |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi (örn. `7d`) |
| `PORT` | API portu (varsayılan 4000) |
| `CORS_ORIGIN` | İzin verilen origin (mobil uygulama için `*` yeterli) |
| `ANTHROPIC_API_KEY` | Fişten otomatik işlem oluşturma özelliği için Claude API anahtarı (opsiyonel, tanımlı değilse özellik kapalı kalır) |

## Veri Modeli

- **User** — kullanıcı hesabı
- **CashAccount** — kasa/banka hesapları (bakiye otomatik güncellenir)
- **Account** — cari hesap (müşteri/tedarikçi), bakiye alacak(+)/borç(-) mantığıyla tutulur
- **Category** — gelir/gider kategorileri
- **Transaction** — gelir, gider veya hesaplar arası transfer işlemleri
- **Invoice / InvoiceItem** — satış/alış faturaları, KDV dahil kalemler, tahsilat/ödeme geçmişi

## API Uçları (özet)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/me

GET/POST            /api/cash-accounts
GET/PATCH/DELETE     /api/cash-accounts/:id

GET/POST            /api/accounts
GET/PATCH/DELETE     /api/accounts/:id
GET                  /api/accounts/:id/transactions

GET/POST            /api/categories
PATCH/DELETE         /api/categories/:id

GET/POST            /api/transactions
GET/PATCH/DELETE     /api/transactions/:id

GET/POST            /api/invoices
GET/DELETE           /api/invoices/:id
POST                 /api/invoices/:id/payments
POST                 /api/invoices/:id/cancel

GET                  /api/dashboard/summary?months=6

POST                 /api/receipts/scan
```

Tüm uçlar (auth hariç) `Authorization: Bearer <token>` header'ı gerektirir.

## Prisma

Şema `prisma/schema.prisma` içindedir. Şema değişikliği sonrası:

```bash
npm run prisma:migrate
```

Veritabanını görsel olarak incelemek için:

```bash
npm run prisma:studio
```

## Yayına Alma (Deploy)

Bu proje standart bir Node.js + PostgreSQL uygulaması olduğu için **paylaşımlı (shared) hosting'lerde çalışmaz** — Node.js Selector ve terminal/SSH erişimi olmayan paketlerde (çoğu "sınırsız" paylaşımlı paket) barındırılamaz. Node.js çalıştırabilen bir servise ihtiyaç var. En kolay ücretsiz seçenek **Railway**:

1. [railway.app](https://railway.app) üzerinde GitHub hesabınızla giriş yapın.
2. **New Project → Deploy from GitHub repo** ile `serhan39/acente` reposunu seçin.
3. Servis ayarlarında **Root Directory** olarak `backend` yazın (repo bir monorepo, backend alt klasörde).
4. Aynı projeye **+ New → Database → PostgreSQL** ekleyin. Railway otomatik olarak `DATABASE_URL` değişkenini backend servisine bağlar (Variables sekmesinden "Reference" ile bağlayın).
5. Backend servisinin **Variables** kısmına ekleyin:
   - `JWT_SECRET` — uzun/rastgele bir metin
   - `JWT_EXPIRES_IN` — `7d`
   - `CORS_ORIGIN` — `*`
   - `ANTHROPIC_API_KEY` — fişten otomatik işlem oluşturma özelliği için [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) adresinden alınan anahtar (opsiyonel; eklenmezse özellik "ANTHROPIC_API_KEY tanımlı değil" hatası döner ama sunucu normal çalışmaya devam eder)

   Bir değişkeni ekledikten/değiştirdikten sonra Railway servisi otomatik olarak yeniden deploy eder; elle yeniden başlatmak isterseniz **Deployments** sekmesinden **Redeploy**'a basabilirsiniz.
6. Deploy tamamlanınca Railway size `https://xxxxx.up.railway.app` gibi bir genel adres verir. `npm start` komutu deploy sırasında otomatik olarak `prisma migrate deploy` çalıştırıp veritabanı şemasını kurar (`package.json` içindeki `start` script'i buna göre ayarlandı).
7. Bu adresi mobil uygulamanın `.env` dosyasında `EXPO_PUBLIC_API_URL=https://xxxxx.up.railway.app/api` şeklinde kullanın.

Alternatif olarak Render.com veya Fly.io da benzer şekilde Node.js + PostgreSQL barındırabilir.
