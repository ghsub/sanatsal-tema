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

## 5. Önizleme ve Onay Kapısı (Push Öncesi Zorunlu Kontrol)
- Yapılan HİÇBİR değişiklik kullanıcının açık onayı olmadan `git commit` veya `git push` ile GitHub'a gönderilmemelidir.
- Her güncelleme sonrasında yerel doğrulamalar (`theme.xml` XML kontrolü, `js/app.js` sözdizimi kontrolü) çalıştırılmalı ve güncel `preview.html` + `css/style.css` + `js/app.js` içeriğini barındıran tek dosyalık HTML önizleme artefaktı (`sanatsal_tema_preview.html`) yenilenerek kullanıcıya sunulmalıdır.
- Kullanıcı önizleme sekmesinde fiziki kontrolü tamamlayıp onay verdikten sonra `git commit` ve `git push` işlemi gerçekleştirilmelidir.

## 6. Kalıcı Sürüm Etiketleme (Git Tag)
- Onaylanıp `main` dalına gönderilen her yeni sürüm için mutlaka açıklamalı bir Git Tag (`git tag -a v1.0.x -m "..."`) oluşturulmalı ve `git push origin v1.0.x` ile GitHub'da kalıcı hale getirilmelidir.
- İstenilen herhangi bir geçmiş sürüme geri dönmek için GitHub'daki ilgili tag üzerinden `theme.xml` alınabilir veya CDN yollarında `@main` yerine `@v1.0.6` gibi doğrudan sürüm etiketi kullanılabilir.

## 7. Dinamik Kullanma Kılavuzu Senkronizasyonu
- Tema özelliklerinde, etiket kurallarında, KaTeX dizgisinde veya galeri/içerik kullanımında herhangi bir değişiklik yapıldığında `docs/BLOG_NASIL_YAZILIR.md` kullanma kılavuzu da aynı güncelleme içinde yeni sürüm numarası ve açıklamalarla güncellenmelidir.
