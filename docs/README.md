# Dijital Kartvizitler

Bu klasör, ekip için tek sayfalık dijital kartvizitleri barındırır. Yapı,
yeni çalışan eklemeyi kolaylaştıracak şekilde şablonlanmıştır.

## Yapı

```
docs/
├── index.html            # Kök sayfa: tüm çalışanları listeleyen dizin
├── assets/
│   ├── card.css           # Ortak tasarım (tüm kartlar + dizin için)
│   └── card.js             # Kartı veriden oluşturan ortak script
└── serhan/
    ├── index.html          # Serhan Merkit'in kartviziti
    └── serhan-merkit.vcf   # Rehbere eklenen vCard dosyası
```

Her çalışanın kartviziti kendi klasöründe yaşar (`docs/<slug>/index.html`),
tasarım ve mantık `assets/card.css` ve `assets/card.js` üzerinden ortak
kullanılır — yeni bir kart eklemek birkaç satırlık veri girmekten ibarettir.

## Yeni çalışan ekleme

1. `docs/serhan/index.html` dosyasını `docs/<slug>/index.html` olarak kopyalayın
   (`<slug>` genelde kişinin adı, örn. `ayse`)
2. İçindeki `TechburdaCard.render({...})` bloğundaki bilgileri güncelleyin
   (`name`, `org`, `phone`, `email`, `website`, `instagram`, `vcf` vb.)
3. `docs/<slug>/<isim>.vcf` dosyasını oluşturun (mevcut `serhan-merkit.vcf`
   içeriğini örnek alabilirsiniz)
4. Kök `docs/index.html` içindeki `employees` dizisine yeni bir satır ekleyin:
   ```js
   { slug: "ayse", name: "Ayşe Yılmaz", org: "..." }
   ```

Yayına aldıktan sonra kart `https://<domain>/<slug>/` adresinde erişilebilir
olur (örn. `https://kart.techburda.com/serhan/`).

## Yayına alma (GitHub Pages)

1. GitHub'da bu depo → **Settings → Pages**
2. **Source**: "Deploy from a branch"
3. **Branch**: varsayılan dal → klasör: **/docs**
4. Kaydedin; birkaç dakika içinde sayfa `https://<kullanici-adiniz>.github.io/acente/`
   adresinde yayına girer

## Özel domain (opsiyonel)

`techburda.com` gibi kendi domaininizle yayınlamak için:

1. Domain sağlayıcınızda bir **CNAME kaydı** ekleyin: `kart` → `<kullanici-adiniz>.github.io`
2. GitHub'da **Settings → Pages → Custom domain** kutusuna `kart.techburda.com` yazıp kaydedin
   (bu, `docs/CNAME` dosyasını otomatik oluşturur/günceller — zaten `kart.techburda.com` olarak repoda mevcut)
3. DNS yayıldıktan sonra **"Enforce HTTPS"** kutusunu işaretleyin

## NFC kartvizite yazma

Bir NFC yazıcı uygulaması (örn. NFC Tools) ile boş bir NFC etiketine ilgili
çalışanın sayfa adresini **"URL/URI" kaydı** olarak yazın. Etikete telefon
yaklaştırıldığında sayfa doğrudan açılır; ziyaretçi "Rehbere Ekle" butonuyla
tek dokunuşla kişilerine kaydedebilir.

## Logo notu

Başlıktaki göz ikonu, paylaşılan logo görselinin renklerine (siyah / mavi /
yeşil) sadık kalınarak SVG olarak yeniden oluşturulmuştur — orijinal logo
dosyasına bu ortamdan erişilemediği için. Gerçek logo dosyanızı eklerseniz
`assets/card.js` içindeki `MARK` sabitini değiştirerek tüm kartlara birden
yansıtabilirsiniz.
