# Blogger İçerik Şablonları (Zero-PII)

Bu dosyadaki HTML şablonlarını Blogger panelinde **Yeni Yayın → HTML Görünümü** kısmına doğrudan yapıştırıp kendi kurgusal veya kamuya açık içeriklerinizle doldurabilirsiniz.

> **Güvenlik Hatırlatması:** Fotoğraf yüklemeden önce EXIF/GPS verilerini temizleyin (`exiftool -all= -overwrite_original gorsel.jpg`) ve e-posta adresinizi düz `mailto:` yerine Base64 kodlu `data-encoded-email` özniteliğiyle ekleyin.

---

## 1. Hakkımda Yayını (Etiket: `Hakkimda`)
*Yayın başlığı Hero bölümündeki ana isim/başlık olarak kullanılır.*

```html
<h2>Unvanınız / Uzmanlık Alanınız</h2>
<p>Birinci biyografi paragrafı: Çalışma alanlarınız, araştırma odak noktalarınız ve teknik yaklaşımınız hakkında kısa özet.</p>
<p>İkinci biyografi paragrafı: Yayınlarınız, ilgi duyduğunuz disiplinler ve bu arşivde paylaştığınız notların kapsamı.</p>

<ul>
  <li>Sistem Mimarisi</li>
  <li>Uygulama Güvenliği</li>
  <li>Kontrol Teorisi</li>
  <li>Belgesel Fotoğrafçılık</li>
</ul>

<!-- İsteğe Bağlı Sosyal Bağlantılar & Bot Korumalı E-Posta -->
<p>
  <a href="https://github.com/kullanici-adiniz">GitHub</a>
  <a href="https://orcid.org/0000-0000-0000-0000">ORCID</a>
</p>
<span data-encoded-email="b3JuZWtAb3JuZWstYWthZGVtaS5pbnZhbGlk"></span>
```

> **Base64 E-Posta Üretme:** Tarayıcı konsolunda `btoa('eposta@ornek.com')` çalıştırıp çıkan metni `data-encoded-email="..."` içine yazabilirsiniz.

---

## 2. Özgeçmiş Yayını (Etiket: `Ozgecmis`)
*Akıllı ayrıştırıcı her `<li>` satırını `Dönem | Başlık | Kurum | Açıklama` formatıyla kronolojik zaman çizelgesine dönüştürür.*

```html
<ul>
  <li>2024 – Günümüz | Kıdemli Sistem Mimarı | Örnek Araştırma Enstitüsü | Dağıtık mimariler ve uygulama güvenliği üzerine araştırma ve geliştirme.</li>
  <li>2020 – 2024 | Doktora Araştırmacısı | Örnek Teknik Üniversitesi | Doğrusal olmayan kontrol sistemleri ve sensör füzyonu üzerine tez çalışması.</li>
  <li>2017 – 2020 | Ar-Ge Mühendisi | Örnek Teknoloji Laboratuvarı | Gömülü telemetri ve gerçek zamanlı veri işleme donanımları.</li>
</ul>
```

---

## 3. Portfolyo Projesi (Etiket: `Portfolyo` + Kategori Etiketi)
*Her proje için ayrı bir yayın oluşturun. `Portfolyo` yanına örneğin `Gömülü Sistemler` etiketini eklerseniz kart rozeti olarak görünür.*

```html
<h1>Örnek Proje Başlığı</h1>
<p>Projenin amacı, mimari yaklaşımı ve elde edilen sonuçların kısa özeti.</p>

<h2>Teknik Mimari</h2>
<p>Sistem bileşenleri ve kullanılan yöntemler hakkında detaylar.</p>

<h2>Matematiksel Model</h2>
<p>Durum güncelleme adımı:</p>
$$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k (z_k - H\hat{x}_{k|k-1})$$
```

---

## 4. Makale / Mühendislik Notu (Etiket: `Mühendislik Notları`, `Fotoğrafçılık`, `Gezi` veya `Otomotiv/Mekanik`)
*`<h2>` ve `<h3>` başlıkları kullandığınızda Okuyucu Modalı otomatik olarak **İçindekiler (TOC)** menüsü üretir.*

```html
<h1>Makale Başlığı</h1>
<p>Giriş paragrafı: Bütçe sınırları (ör. $120) normal metin olarak korunurken, KaTeX formülleri yalnızca ayraçlar içinde işlenir.</p>

<h2>1. Teorik Çerçeve</h2>
<p>Satır içi formül örneği: \( \eta = 1 - \frac{T_c}{T_h} \) şeklinde hesaplanır.</p>

<h2>2. Temel Denklem</h2>
$$\nabla \cdot (\rho \mathbf{u}) = 0$$
```

---

## 5. Fotoğraf Galerisi Yayını (Etiket: `Galeri`)
*Yayın içine eklediğiniz tüm görseller otomatik olarak `/s1600/` tam çözünürlüğe yükseltilir ve şeffaf koruma katmanıyla listelenir.*

```html
<p>
  <img src="https://blogger.googleusercontent.com/img/..." alt="Kısa görsel açıklaması" title="Fotoğraf Başlığı — 50mm f/2.0" />
</p>
```
