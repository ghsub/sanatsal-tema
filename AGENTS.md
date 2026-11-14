# Proje Mimarisi ve Güvenlik Kuralları (Blogger Headless CMS)

## 1. Zero-PII (Sıfır Kişisel Veri) İlkesi
- Bu repo `Public` durumundadır. `theme.xml`, `preview.html`, `css/style.css`, `js/app.js` ve `README.md` dahil HİÇBİR dosyaya gerçek isim, e-posta, telefon, konum, gerçek özgeçmiş veya kişisel fotoğraf bağlantısı yazma.
- `preview.html` için yalnızca kurgusal/anonim test verileri kullan. Gerçek veriler sadece Blogger JSON Feed üzerinden çekilir.

## 2. Blogger XML ve CDN Kuralları
- `theme.xml` içinde tüm etiketler geçerli XHTML/XML formatında kapatılmalı (`<meta .../>`, `<link .../>`), `<script>` etiketlerinin Blogger XML derleyicisi tarafından kendi kendine kapatılmasını (`/>`) önlemek için içlerine `/* */` eklenmeli, URL parametrelerindeki `&` karakterleri `&amp;` olarak kaçırılmalıdır.
- CSS veya JS dosyalarında değişiklik yapıldığında jsDelivr önbelleğini yenilemek için `theme.xml` içindeki `?v=1.0.x` sürüm numarasını bir artır.
- Zorunlu Blogger `<b:skin>` ve `<b:widget id='Blog1'>` bloklarına dokunma.

## 3. Uygulama Güvenliği (XSS, SRI, CSP, Anti-Bot)
- Blogger JSON Feed'den gelen tüm HTML içerikleri `DOMPurify.sanitize()` ile temizlenmeden DOM'a basılmamalıdır.
- `DOMPurify` kütüphanesi harici SRI uyuşmazlıklarını önlemek için doğrudan repo içinde (`js/purify.min.js`) barındırılır; `theme.xml` içinde `https://cdn.jsdelivr.net/gh/ghsub/sanatsal-tema@main/js/purify.min.js?v=1.0.x` ve `preview.html` içinde `./js/purify.min.js` üzerinden yüklenir.
- Sağ tık (`contextmenu`), sürükleme (`dragstart`) ve kopyalama caydırıcılığını koru; `security/bots.json` ve `navigator.webdriver` kontrollerini devre dışı bırakma.

## 4. Matematiksel Dizgi (KaTeX) ve Veri Yönlendirme
- KaTeX render motorunu yalnızca blok formüller için `$$...$$` ve satır içi formüller için `\( ... \)` ayraçlarıyla çalıştır; normal metindeki tek `$` (para birimi) işaretlerine dokunma.
- Blogger JSON Feed isteklerini CORS hatası almamak için her zaman göreceli yoldan (`/feeds/posts/default?alt=json&max-results=150`) yap ve görsel URL'lerindeki `/s72-c/` eklerini `/s1600/` olarak dönüştür.
- Etiket eşleşmelerini koru: `Hakkimda`, `Ozgecmis`, `Portfolyo`, `Mühendislik Notları`, `Fotoğrafçılık`, `Gezi`, `Otomotiv/Mekanik`, `Galeri`.
