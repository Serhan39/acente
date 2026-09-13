# SERTEK BİLİŞİM MERKEZİ

SERTEK YAZILIM SANAYİ VE TİCARET LİMİTED ŞİRKETİ için özel geliştirilen CRM + Pazaryeri Entegrasyonu + Merkezi Ürün/Stok Yönetim Sistemi.

> **Not:** Bu sistem, bu reponun `backend/` ve `mobile/` klasörlerindeki "Acente — Mobil Muhasebe Yazılımı" projesinden tamamen bağımsızdır. Ortak hiçbir kod/veritabanı kullanmaz.

## Proje Durumu

🚧 **Aşama 1 — Analiz ve Mimari** (devam ediyor). Henüz çalışan uygulama kodu yok; bu aşamada sadece mimari doküman, veritabanı şeması ve API sözleşme taslağı hazırlanıyor.

## Klasör Yapısı (planlanan)

```
sertek-bilisim/
├── backend/                # FastAPI + SQLAlchemy + Celery (Aşama 2'de eklenecek)
├── frontend/                # React + TypeScript + Ant Design (Aşama 2'de eklenecek)
├── docker-compose.yml       # Aşama 2'de eklenecek (backend/frontend kodu olmadan anlamsız)
├── .env.example              # Aşama 2'de eklenecek
└── docs/
    ├── MIMARI.md              # Teknoloji mimarisi ve gerekçeleri
    ├── MODULLER.md             # Modül listesi ve geliştirme planı (Aşama 1-8)
    ├── ENTEGRASYON_RISKLERI.md # Pazaryeri/Meta/WooCommerce teknik riskleri ve gereksinimleri
    ├── db/
    │   └── schema.sql           # Tam PostgreSQL DDL şeması
    └── api/
        └── openapi-outline.yaml # Üst düzey API sözleşme taslağı
```

## Geliştirme Planı (Aşamalar)

1. ✅ Analiz ve mimari (bu doküman seti)
2. ⬜ Temel sistem: auth, dashboard, ürün CRUD, kategori/marka, Excel/CSV içe aktarma
3. ⬜ CRM: müşteriler, potansiyel müşteriler, satış aşamaları, teklifler
4. ⬜ WooCommerce: techburda.com, guvenlikkamerasistemleri.com
5. ⬜ Pazaryerleri: Trendyol, Hepsiburada, Teknosa, ÇiçekSepeti, n11
6. ⬜ XML tedarikçi entegrasyonu
7. ⬜ Meta Lead Ads
8. ⬜ Raporlar, güvenlik sertleştirme, üretim kurulumu

Detaylar için `docs/MODULLER.md`.
