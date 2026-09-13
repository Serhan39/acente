# Entegrasyon Riskleri ve Gereksinimleri

Bu doküman, her entegrasyonun API durumunu ve Aşama 4-7'ye başlamadan önce kullanıcıdan alınması gereken bilgileri listeler. Gerçek kimlik bilgileri olmadan hiçbir kanal "bağlandı" veya "başarılı" olarak gösterilmeyecek — bağlantı test butonu gerçek bir API çağrısı yapacak.

## Pazaryerleri

### Trendyol
- Resmi Marketplace/Entegrasyon API mevcut: ürün oluşturma/güncelleme, stok/fiyat güncelleme, sipariş çekme destekleniyor.
- **Risk:** Kategori bazlı zorunlu özellik (attribute) şeması sık değişir ve kategori başına farklıdır — güvenlik kamerası kategorisinde çok sayıda teknik özellik alanı beklenir. Ürün gönderimi Trendyol tarafında inceleme/onay sürecine tabi olabilir, anlık yayın garantisi yoktur.
- **Gerekli:** Satıcı ID, API Key, API Secret (Trendyol Partner panelinden).

### Hepsiburada
- Resmi Merchant API mevcut: ürün/stok/fiyat/sipariş destekleniyor.
- **Risk:** Barkod/GTIN zorunluluğu sıkı; bazı kategorilerde listing onayı gerekir.
- **Gerekli:** Merchant ID, kullanıcı adı/şifre veya API anahtarı (Hepsiburada Merchant panelinden).

### Teknosa
- ⚠️ **Doğrulanamadı:** Teknosa'nın herkese açık, self-servis bir pazaryeri satıcı API'si olduğuna dair güvenilir, güncel resmi dokümantasyon bulunamadı. Var olduğu varsayılıp sahte bağlantı gösterilmeyecek.
- **Yapılacak:** Adapter arayüzü (interface) diğer kanallarla aynı şekilde hazırlanacak, ancak gerçek implementasyon API erişimi/dokümantasyon sağlanana kadar "devre dışı" işaretlenecek.
- **Sizden gerekli:** Teknosa iş ortaklığı/satıcı entegrasyon ekibiyle görüşüp API erişim sözleşmesi ve teknik dokümantasyon almanız.

### ÇiçekSepeti
- Pazaryeri (satıcı) API'si mevcut ancak platformun öncelikli odağı çiçek/hediye kategorisi.
- **Risk:** Elektronik/güvenlik ürünleri kategorisinin ÇiçekSepeti'nde satışa uygun olup olmadığı ve satıcı başvurunuzun onaylanıp onaylanmadığı teyit edilmeli.
- **Gerekli:** Satıcı paneli API anahtarı.

### n11
- Marketplace API mevcut (eski SOAP tabanlı + yeni REST tabanlı sürüm bulunuyor).
- **Risk:** Mağazanıza hangi API sürümünün tanımlı olduğu başvuru/panel üzerinden teyit edilmeli.
- **Gerekli:** App Key, App Secret (n11 Pro panelinden).

## Genel Pazaryeri Riskleri

- Her kanalın kendi rate limiti var → tüm senkronizasyon işleri Celery kuyruğunda, retry/exponential backoff ile yapılacak.
- Bir kanal API'si geçici olarak çökse/yanıt vermese bile diğer kanallar ve web siteleri etkilenmeyecek (adapter izolasyonu).
- Ürün gönderimi bazı platformlarda anlık değil, onay sürecine tabi olabilir — sistemde bu durum "gönderildi / onay bekliyor / yayında / reddedildi" gibi ayrı bir durumla takip edilecek, "başarılı" diye yanıltıcı gösterilmeyecek.
- Tekrarlanan senkronizasyonlarda duplicate ürün/sipariş oluşmasını önlemek için harici ID (external_order_id / external_product_id) üzerinden `UNIQUE` kısıt kullanılacak.

## Meta Lead Ads

**Gerekli:**
- Meta Business Manager hesabı, ilgili Facebook Sayfası'nın (Page) sahipliği/yöneticiliği
- Meta for Developers üzerinde oluşturulmuş bir App (App ID + App Secret)
- Uzun ömürlü Page Access Token
- `leads_retrieval`, `pages_manage_ads`, `pages_read_engagement` izinleri
- **Risk:** Bu izinler Meta'nın App Review (uygulama incelemesi) sürecinden geçmeyi gerektirir; bazı durumlarda İş Doğrulaması (Business Verification) de istenir. Bu süreç günler/haftalar sürebilir ve tamamen Meta'nın onayına bağlıdır, bizim kontrolümüzde değildir.
- Webhook endpoint'imizin herkese açık, geçerli SSL sertifikalı bir HTTPS adresi olması gerekir (sunucu hazır olunca kurulacak).
- Lead formlarının (Form ID) sizin tarafınızdan Meta Ads Manager'da oluşturulmuş olması gerekir.

## WooCommerce (techburda.com, guvenlikkamerasistemleri.com)

**Her site için ayrı ayrı gerekli:**
- WooCommerce → Ayarlar → Gelişmiş → REST API'den oluşturulmuş Consumer Key/Secret (Okuma/Yazma izniyle)
- WordPress ve WooCommerce sürüm bilgisi
- Aktif tema ve özellikle stok/fiyat ile ilgili eklentiler listesi (çakışma riskini değerlendirmek için)
- Sitenin SSL sertifikasının aktif olduğunun teyidi
- Hosting sağlayıcısının (Natro ise) REST API isteklerini bir WAF/güvenlik duvarı ile engellemediğinin teyidi — bazı paylaşımlı hostingler bunu varsayılan olarak kısıtlayabiliyor.

## Sizden İstenecek Bilgiler — Özet Tablo

| Bilgi | Ne zaman gerekli |
|---|---|
| Repo tercihi (mevcut `acente` reposu mu, ayrı repo mu) | Şimdi |
| Trendyol/Hepsiburada/ÇiçekSepeti/n11 satıcı API kimlik bilgileri | Aşama 5 başlamadan önce |
| Teknosa API erişim durumu | Aşama 5 (Teknosa kısmı) başlamadan önce |
| Meta App ID/Secret, Page ID, App Review durumu | Aşama 7 başlamadan önce |
| WooCommerce Consumer Key/Secret (2 site) | Aşama 4 başlamadan önce |
| XML tedarikçi listesi ve örnek formatlar | Aşama 6 başlamadan önce |
| VPS bilgisi (var olan/yeni alınacak) ve domain | Aşama 8 / üretim kurulumundan önce |
