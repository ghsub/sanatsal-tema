# Sanatsal Tema — Zero-PII Headless Blogger Altyapısı

Blogger'ı arka planda başsız (headless) CMS olarak kullanan, **Sıfır Kişisel Veri Sızıntısı (Zero-PII)** prensibine sahip, otonom güvenlik güncellemeli ve Modern Editoryal / Akademik tasarımlı kişisel web sitesi şablonu.

> **Gizlilik İlkesi:** Bu depo `Public` olarak tasarlanmıştır. Depo içerisinde gerçek isim, e-posta, telefon, adres, gerçek özgeçmiş veya kişisel fotoğraf bağlantısı **bulunmaz**. Tüm gerçek içerikler yalnızca çalışma anında Blogger JSON beslemesinden (`/feeds/posts/default?alt=json&max-results=150`) çekilir.

---

## Dosya Yapısı

- `theme.xml` — Blogger XML ayrıştırıcısıyla uyumlu, CSP, `noarchive/noimageindex`, `no-referrer` ve SRI doğrulamalı kütüphanelerle sertleştirilmiş ana şablon.
- `css/style.css` — Kırık beyaz (`#FAF9F6`) ve koyu tema (`[data-theme="dark"]`) destekli editoryal tipografi, kopyalama caydırıcılığı ve medya kalkanı.
- `js/app.js` — Çok katmanlı anti-bot kalkanı, davranışsal DOM kapısı, göreceli Blogger JSON Feed ayrıştırıcısı, DOMPurify XSS temizleyici, KaTeX (`$$...$$` ve `\(...\)`) motoru, hash yönlendirici ve yerel önizleme modu.
- `security/bots.json` — Bilinen AI eğitim botları, arşivleyiciler ve headless kazıyıcı imzaları.
- `.github/workflows/auto-security-update.yml` — Her Pazar UTC 03:00'te `ai-robots-txt` kaynağından güncel bot imzalarını çekip `security/bots.json` dosyasını otomatik güncelleyen GitHub Actions iş akışı.
- `preview.html` — Kurulum öncesi kurgusal/anonim verilerle yerel test yapmanızı sağlayan bağımsız önizleme sayfası.

---

## Blogger Etiket Sözlüğü

Blogger panelinizde yayınlarınızı aşağıdaki etiketlerle kategorize ederek sitenin ilgili bölümlerini otomatik besleyebilirsiniz:

| Etiket | Hedef Bölüm | Açıklama ve Format İpucu |
| :--- | :--- | :--- |
| `Hakkimda` | Hero & Hakkımda (`#hakkimda`) | Başlık adınız/site başlığı olarak kullanılır. `<h2>` veya `<h3>` ile unvan, `<p>` ile biyografi, `<ul><li>` ile yetkinlik rozetleri ve `<a href="mailto:...">` veya sosyal bağlantılar eklenebilir. |
| `Ozgecmis` | Özgeçmiş (`#ozgecmis`) | Liste (`<li>`) veya paragraflar içinde `Dönem | Başlık | Kurum | Açıklama` formatını kullanırsanız akıllı ayrıştırıcı otomatik kronolojik zaman çizelgesi üretir. |
| `Portfolyo` | Portfolyo (`#portfolyo`) | Proje kartı olarak listelenir, tıklandığında tam ekran detay modalı açılır. Ek bir etiket (örn. `Gömülü Sistemler`) kategori rozeti olarak görünür. |
| `Mühendislik Notları` | Yazılar (`#yazilar`) | Mühendislik kategorisi altında listelenir. KaTeX formülleri için blokta `$$...$$`, satır içinde `\(...\)` kullanın. |
| `Fotoğrafçılık` | Yazılar (`#yazilar`) | Fotoğrafçılık kategorisi altında listelenir. |
| `Gezi` | Yazılar (`#yazilar`) | Gezi kategorisi altında listelenir. |
| `Otomotiv/Mekanik` | Yazılar (`#yazilar`) | Otomotiv ve mekanik kategorisi altında listelenir. |
| `Galeri` | Fotoğraf Galerisi (`#galeri`) | Yayın içindeki tüm görseller otomatik toplanıp `/s1600/` tam çözünürlüğe yükseltilir; ilk 12 fotoğraf gösterilir ve *"Daha Fazla Yükle"* ile genişler. |

---

## Fotoğraf Yüklemeden Önce EXIF / GPS Temizliği

Blogger'a fotoğraf yüklemeden önce görsellerdeki kamera seri numarası, çekim tarihi ve **GPS konum koordinatları (EXIF/IPTC/XMP)** gibi kişisel meta verileri mutlaka temizleyin:

```bash
# ExifTool ile tüm meta verileri temizleme (Linux/macOS/Windows)
exiftool -all= -overwrite_original fotograf.jpg
```

---

## CDN Önbellek Yenileme (`?v=1.0.x`)

`theme.xml` dosyası CSS, JS ve `bots.json` dosyalarını jsDelivr CDN üzerinden çeker. Depoda bir güncelleme yaptığınızda tarayıcı ve CDN önbelleğini temizlemek için `theme.xml` içindeki sürüm parametresini artırın:

1. `theme.xml` içinde `?v=1.0.0` değerlerini `?v=1.0.1` (veya yeni sürüme) güncelleyin.
2. Güncellenmiş `theme.xml` dosyasını Blogger -> **Tema** -> **HTML'yi Düzenle** ekranına yapıştırıp kaydedin.
3. Gerekirse jsDelivr önbelleğini anlık temizlemek için URL'deki `cdn.jsdelivr.net` yerine `purge.jsdelivr.net` adresini tarayıcıda ziyaret edin.

---

## Acil Durum Geri Dönüş (Rollback) Adımları

1. **Blogger Üzerinden Hızlı Geri Dönüş:** Yeni temayı yüklemeden önce Blogger -> **Tema** -> **Yedekle** ile mevcut XML yedeğinizi indirin. Sorun yaşarsanız **Geri Yükle** ile önceki şablona saniyeler içinde dönebilirsiniz.
2. **Git / CDN Sürümüne Dönüş:** Son CSS/JS değişikliği sorun çıkardıysa depoda `git revert HEAD` yapıp `main` dalına itin ve `theme.xml` içindeki `?v=1.0.x` sorgu dizesini artırın.
3. **Doğrulama:** Değişiklik sonrası `preview.html` dosyasını açarak tüm bölümlerin, modal pencerelerin ve KaTeX formüllerinin hatasız çalıştığını doğrulayın.