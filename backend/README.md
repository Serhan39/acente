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
