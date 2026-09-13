# Modül Listesi ve Geliştirme Planı

## Backend Modülleri (servis bazlı)

| Modül | Sorumluluk |
|---|---|
| `auth` | Kullanıcı girişi, JWT/refresh token, rol yönetimi |
| `catalog` | Ürün, kategori, marka, görsel/video, kanal bazlı listeleme |
| `stock` | Merkezi/rezerve/satılabilir stok, depo, stok hareket geçmişi |
| `suppliers` | XML tedarikçi tanımı, çekme, eşleştirme, senkron logları |
| `channels` | Pazaryeri + WooCommerce kanal tanımı, kimlik bilgisi, komisyon oranı |
| `channel_adapters/trendyol` | Trendyol connector |
| `channel_adapters/hepsiburada` | Hepsiburada connector |
| `channel_adapters/teknosa` | Teknosa connector (API erişimi netleşene kadar iskelet) |
| `channel_adapters/ciceksepeti` | ÇiçekSepeti connector |
| `channel_adapters/n11` | n11 connector |
| `channel_adapters/woocommerce` | WooCommerce connector (çoklu site) |
| `orders` | Sipariş toplama, durum takibi, kâr hesaplama |
| `crm` | Müşteri, lead, satış aşaması, not, aktivite, teklif |
| `meta_leads` | Meta Lead Ads webhook + Graph API senkronizasyonu |
| `pricing` | Komisyon/kargo/KDV bazlı kâr marjı hesaplama |
| `reports` | Satış/kâr/stok raporları |
| `integration_logs` | Tüm kanal/tedarikçi senkron logları, yeniden deneme |
| `settings` | Sistem ayarları, kur bilgisi |
| `audit` | Audit log |

## Frontend Menüsü

1. Dashboard
2. CRM
3. Müşteriler
4. Teklifler
5. Ürünler
6. Kategoriler
7. Markalar
8. XML Tedarikçiler
9. Pazaryerleri
10. Siparişler
11. Stok Yönetimi
12. Fiyat Yönetimi
13. Raporlar
14. Kullanıcılar
15. Ayarlar
16. Entegrasyon Logları

## Geliştirme Aşamaları

### Aşama 1 — Analiz ve Mimari ✅ (bu doküman seti)
Mimari, veritabanı şeması, API sözleşme taslağı, klasör yapısı.

### Aşama 2 — Temel Sistem
Kullanıcı girişi/yetkilendirme, dashboard iskeleti, veritabanı migration'ları, ürün CRUD, kategori/marka, ürün görselleri, Excel/CSV içe aktarma.

### Aşama 3 — CRM
Müşteriler, potansiyel müşteriler, özelleştirilebilir satış aşamaları, notlar, takip tarihleri, teklifler, CRM raporları.

### Aşama 4 — WooCommerce
techburda.com ve guvenlikkamerasistemleri.com bağlantıları, ürün aktarımı, stok/fiyat güncelleme, sipariş çekme, webhook.

### Aşama 5 — Pazaryerleri
Trendyol, Hepsiburada, ÇiçekSepeti, n11 sırayla; her biri ayrı geliştirilip test edilecek. Teknosa: API erişimi netleşene kadar adapter iskeleti hazır, devre dışı.

### Aşama 6 — XML Tedarikçi Entegrasyonu
XML bağlantıları, ürün eşleştirme, stok/fiyat güncelleme, ürün aktarımı.

### Aşama 7 — Meta Ads
Lead Ads webhook, CRM otomatik kayıt, reklam kaynak takibi.

### Aşama 8 — Raporlar ve Üretim
Satış/kâr/stok raporları, hata logları, yedekleme, güvenlik sertleştirme, üretim kurulumu.

Her aşama sonunda: çalışan kod + test + kullanıcıya özet açıklama. Büyük değişikliklerde onay istenecek; küçük/güvenli adımlarda onay beklenmeden ilerlenecek.
