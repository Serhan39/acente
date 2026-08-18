# Dijital Kartvizit — Serhan Merkit

Bu klasör, `docs/index.html` üzerinden yayınlanan tek sayfalık dijital kartviziti içerir.

## Yayına alma (GitHub Pages)

1. GitHub'da bu depo → **Settings → Pages**
2. **Source**: "Deploy from a branch"
3. **Branch**: `main` (bu dal `main`'e birleştirildikten sonra) → klasör olarak **/docs** seçin
4. Kaydedin; birkaç dakika içinde sayfa şu adreste yayına girer:
   `https://<kullanici-adiniz>.github.io/acente/`

## NFC kartvizite yazma

Bir NFC yazıcı uygulaması (örn. NFC Tools) ile boş bir NFC etiketine yukarıdaki
GitHub Pages adresini **"URL/URI" kaydı** olarak yazın. Etikete telefon
yaklaştırıldığında sayfa doğrudan açılır; ziyaretçi "Rehbere Ekle" butonuyla
tek dokunuşla kişilerine kaydedebilir.

## Rehbere ekle dosyası (vCard)

`serhan-merkit.vcf` dosyası doğrudan indirilebilir bir vCard'dır. İsterseniz
NFC etiketini doğrudan bu dosyanın adresine de yönlendirebilirsiniz —
bu durumda telefon, sayfayı açmadan direkt "kişi ekle" ekranını gösterir.

## Bilgileri güncellemek

Tüm metin ve bağlantılar `index.html` içinde düz metin olarak yer alır;
`serhan-merkit.vcf` içindeki bilgilerle birlikte güncel tutulmalıdır.

## Logo notu

Başlıktaki göz ikonu, paylaşılan logo görselinin renklerine (siyah / mavi /
yeşil) sadık kalınarak SVG olarak yeniden oluşturulmuştur — orijinal logo
dosyasına bu ortamdan erişilemediği için. Gerçek logo dosyanızı
`docs/assets/logo.png` olarak eklerseniz, `index.html` içindeki `<svg class="mark">`
bloğunu `<img class="mark" src="assets/logo.png" alt="Sertek Bilişim">` ile
değiştirebilirim.
