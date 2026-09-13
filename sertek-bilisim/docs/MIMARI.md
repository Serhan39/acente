# Mimari

## Teknoloji Yığını ve Gerekçeler

| Katman | Seçim | Gerekçe |
|---|---|---|
| Backend | Python 3.12 + FastAPI | Async I/O, otomatik Swagger/OpenAPI, güçlü XML/Excel/CSV işleme kütüphaneleri (pandas, lxml) — çoklu kanal senkronizasyonu için uygun |
| ORM / Migration | SQLAlchemy 2.0 + Alembic | Transaction ve satır kilitleme (`SELECT ... FOR UPDATE`) desteği stok yarış koşulunu önlemek için kritik |
| Veritabanı | PostgreSQL 16 | JSONB (kanal-özel veri, ham API payload), güçlü transaction garantisi, `CHECK` kısıtları ile eksi stok koruması |
| Kimlik doğrulama | JWT access token (kısa ömürlü) + refresh token (httpOnly cookie) + RBAC middleware | Standart, harici servis gerektirmez |
| Arka plan görevleri | Celery + Redis (broker + result backend) + Celery Beat | XML/pazaryeri/Meta senkronizasyonu, retry/backoff, rate-limit yönetimi — kuyruk tabanlı olduğu için bir kanal çökünce sistem durmaz |
| Frontend | React 18 + TypeScript + Vite + Ant Design | Hazır Table/Form/Upload/DatePicker (TR locale) bileşenleri CRUD-ağırlıklı panel geliştirmeyi hızlandırır, ücretsiz/MIT |
| Sunucu state | TanStack Query | Cache, retry, optimistic update — API-ağırlıklı panel için standart |
| Grafikler | Recharts / ApexCharts | Dashboard ve raporlar |
| Konteynerleştirme | Docker Compose | Dev ve prod ortamları `.env` ile ayrılır, tek komutla ayağa kalkar |
| Reverse proxy / SSL | Caddy | Otomatik Let's Encrypt, Nginx'e göre daha az yapılandırma |
| Dosya depolama | v1: Docker volume üzerinde disk. İleride: self-host MinIO (S3 uyumlu) | Ücretli SaaS zorunluluğu yok |
| Loglama | structlog + DB'de yapılandırılmış entegrasyon logları | Harici ücretli servis (Sentry vb.) zorunlu değil, istenirse ücretsiz katmanla eklenebilir |

**Zorunlu ücretli/harici SaaS yok.** Tek dış bağımlılık: pazaryeri/Meta/WooCommerce API'lerinin kendisi (kullanıcının kendi hesapları).

## Neden bu yığın, neden alternatifler değil

- **FastAPI vs NestJS (mevcut `acente` reposundaki mobil projede Node+Prisma kullanılıyor):** Celery'nin arka plan görev ekosistemi ve Python'un veri işleme kütüphaneleri (XML parse, pandas ile Excel/CSV) çoklu kanal senkronizasyonu için daha olgun. Ekip aşinalığı önceliklendirilmek istenirse NestJS + Prisma + BullMQ ile eşdeğer mimari kurulabilir.
- **Ant Design vs özel component kütüphanesi:** Kullanıcı geliştirici değil; uzun vadeli bakım kolaylığı için hazır, iyi test edilmiş bileşenler tercih edildi.
- **Celery vs basit APScheduler:** Çoklu kanal + retry + rate-limit + görev izleme (Flower) ihtiyacı olduğundan Celery seçildi; APScheduler tek-worker senaryolar için yeterli olurdu ama ölçeklenmiyor.

## Servis Mimarisi (yüksek seviye)

```
                         ┌─────────────────────┐
                         │   React Panel (SPA)  │
                         └──────────┬───────────┘
                                    │ REST (JWT)
                         ┌──────────▼───────────┐
                         │   FastAPI (API)       │
                         │  - Auth/RBAC           │
                         │  - Ürün/Stok/CRM CRUD  │
                         │  - Webhook alıcıları    │
                         └──────────┬───────────┘
                    ┌───────────────┼───────────────┐
                    │               │               │
           ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼───────┐
           │ PostgreSQL 16  │ │ Redis        │ │ Celery Worker │
           │ (ana veri)     │ │ (broker/cache)│ │ + Celery Beat │
           └────────────────┘ └─────────────┘ └───────┬───────┘
                                                        │
                        ┌───────────────┬───────────────┼───────────────┬───────────────┐
                        │               │               │               │               │
                 ┌──────▼─────┐ ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
                 │ Pazaryeri   │ │ WooCommerce   │ │ XML Tedarikçi│ │ Meta Lead   │ │ Kur/Diğer   │
                 │ Adapter'ları│ │ Adapter'ları  │ │ Senkronizasyon│ │ Ads Webhook │ │ Görevler    │
                 │ (Trendyol,  │ │ (techburda,   │ │              │ │             │ │             │
                 │ Hepsiburada,│ │ guvenlikkam.) │ │              │ │             │ │             │
                 │ n11, ...)   │ │               │ │              │ │             │ │             │
                 └─────────────┘ └───────────────┘ └──────────────┘ └─────────────┘ └─────────────┘
```

Her kanal adapter'ı birbirinden izole çalışır (ayrı Celery task'ları, ayrı hata yakalama) — bir pazaryeri API'si çökse bile diğer kanallar ve web siteleri çalışmaya devam eder.

## Stok Tutarlılığı ve Yarış Koşulu Önleme

Merkezi stok düşümü her zaman tek bir veritabanı transaction'ı içinde, ilgili `stock_items` satırı `SELECT ... FOR UPDATE` ile kilitlenerek yapılır. Bu sayede iki kanaldan (örn. Trendyol ve web sitesi) aynı anda gelen siparişler sırayla işlenir, negatif stok oluşmaz (`CHECK (satilabilir_stok >= 0)` veritabanı kısıtı ek güvenlik katmanıdır). Stok değişikliği sonrası ilgili ürünün aktif olduğu tüm kanallara stok güncelleme görevi Celery kuyruğuna atılır (senkron değil, asenkron — kullanıcı arayüzü beklemez).

## Güvenlik

- Şifreler: bcrypt/argon2 hash
- API secret/token'lar: veritabanında şifrelenmiş (Fernet/AES, anahtar `.env`'de, koda gömülmez)
- Rol bazlı yetkilendirme: Admin / Yönetici / Satış Personeli / Ürün Yöneticisi / Salt Görüntüleme
- Rate limiting: kritik endpoint'lerde (özellikle webhook ve auth)
- Audit log: kritik işlemler (fiyat/stok değişikliği, kullanıcı yetkisi değişikliği vb.)
- CSRF/XSS/SQL injection: FastAPI+SQLAlchemy parametreli sorgular, Pydantic doğrulama, React'in varsayılan XSS koruması
- Üretimde `DEBUG=False`, ayrıntılı hata mesajları sadece loglara
