# Blog Nasıl Yazılır? — Blogspot (Blogger) Dinamik Kullanma Kılavuzu

> **Yaşayan Kılavuz:** Bu rehber, temanın güncel sürümü (**v1.0.8**) ile birebir uyumludur. Temaya eklenen veya değişen her özellik sonrasında bu kılavuz da otomatik olarak güncellenir.

Blogger panelinizden (**Yeni Yayın**) standart bir blog yazısı oluştururken yalnızca **Başlık**, **İçerik** ve sağ taraftaki **Etiketler (Labels)** alanını kullanırsınız. Tema, verdiğiniz etikete göre yayını sitenin ilgili bölümüne otomatik yerleştirir.

---

## 1. Kullanılabilir Etiketler (Labels)

Aşağıdaki etiketler sitenin hangi bölümünü beslediğini belirler. Büyük-küçük harf ve Türkçe karakter farkları (`Hakkimda` / `Hakkımda` / `hakkimda`) tema tarafından otomatik tanınır:

| Etiket | Sitedeki Bölümü | Nasıl Kullanılır? |
| :--- | :--- | :--- |
| `Hakkimda` | **Hakkımda (Hero)** | Yayın **Başlığı** ana isim/başlık olarak görünür. İçerikte `<h2>` veya `<h3>` unvan, `<p>` biyografi, `<ul><li>` yetkinlik rozetleri, sosyal linkler ve isteğe bağlı Bot Korumalı E-Posta yer alabilir. |
| `Ozgecmis` | **Özgeçmiş** | Liste (`<li>`) veya paragraflarda `Dönem | Başlık | Kurum | Açıklama` biçimini kullanın; otomatik kronolojik zaman çizelgesine dönüşür. |
| `Portfolyo` | **Portfolyo** | Her proje için ayrı bir yayın açın. Yanına ek bir etiket (örn. `Gömülü Sistemler`) eklerseniz kart rozeti olarak görünür. |
| `Mühendislik Notları` | **Yazılar** | Yazılar bölümünde *Mühendislik Notları* kategorisinde listelenir. |
| `Fotoğrafçılık` | **Yazılar** | Yazılar bölümünde *Fotoğrafçılık* kategorisinde listelenir. |
| `Gezi` | **Yazılar** | Yazılar bölümünde *Gezi* kategorisinde listelenir. |
| `Otomotiv/Mekanik` | **Yazılar** | Yazılar bölümünde *Otomotiv/Mekanik* kategorisinde listelenir. |
| `Galeri` | **Fotoğraf Galerisi** | Yayın içine eklediğiniz tüm görseller otomatik toplanır, `/s1600/` tam çözünürlüğe yükseltilir ve Lightbox galeride sergilenir. |
| `Iletisim` | **İletişim** | Sosyal bağlantılarınızı ve bot korumalı e-postanızı ayrı bir yayında tutmak isterseniz bu etiketi kullanabilirsiniz. |

> **Not:** Yazılar bölümünde özel bir kategori etiketi seçmezseniz yayın varsayılan olarak `Mühendislik Notları` altında gösterilir.

---

## 2. Matematiksel Formül (KaTeX) Nasıl Eklenir?

Tema, akademik ve mühendislik notları için **KaTeX** dizgi motorunu yerleşik olarak barındırır. Blogger editöründe formülleri iki şekilde yazabilirsiniz:

1. **Satır İçi Formül (`\( ... \)`):**
   Metin akışı içinde formül göstermek için `\(` ve `\)` ayraçlarını kullanın.
   - Örnek: `İdeal verimlilik \( \eta = 1 - \frac{T_c}{T_h} \) formülüyle bulunur.`

2. **Blok (Ortalanmış) Formül (`$$ ... $$`):**
   Ayrı bir satırda büyük denklem göstermek için `$$` ayraçlarını kullanın.
   - Örnek:
     ```text
     $$\nabla \cdot (\rho \mathbf{u}) = 0$$
     ```

> **Para Birimi (`$`) Güvenliği:** Normal metin içinde yazdığınız tek `$` işaretleri (örneğin `$120 bütçe`) formül olarak yorumlanmaz, olduğu gibi korunur.

---

## 3. Fotoğraf ve Galeri Nasıl Eklenir?

### A) Yükleme Öncesi Gizlilik (EXIF / GPS Temizliği)
Fotoğraflarda kamera modeli, çekim tarihi ve **GPS konum koordinatları** bulunabilir. Blogger'a yüklemeden önce mutlaka temizleyin:

```bash
exiftool -all= -overwrite_original fotograf.jpg
```

### B) Blogger Editöründen Ekleme
1. Blogger'da **Galeri** etiketli bir yayın açın (veya mevcut Galeri yayınına ekleme yapın).
2. Editörün üst çubuğundan **Resim Ekle** simgesine tıklayıp fotoğraflarınızı yükleyin.
3. Tema, Blogger'ın küçük önizleme adreslerini (`/s72-c/`, `/w640-h480/` vb.) otomatik olarak tam çözünürlüklü `/s1600/` adresine yükseltir.
4. Görselin **Alt Metin (alt)** veya **Başlık (title)** alanına yazdığınız açıklama, Lightbox tam ekran penceresinde fotoğraf altı yazısı olarak görünür.
5. Galeri ilk açılışta 12 kare gösterir; fazlası varsa **"Daha Fazla Yükle"** butonuyla açılır.

---

## 4. Otomatik Özellikler (İçindekiler, Arama, Okuma Süresi, Yazdırma)

- **Otomatik İçindekiler (TOC):** Yazınızın içinde en az 2 adet alt başlık (**Başlık / `<h2>`** veya **Alt Başlık / `<h3>`**) kullanırsanız, okuyucu penceresinin üstünde otomatik tıklanabilir **İçindekiler** menüsü oluşur.
- **Okuma İlerleme Çubuğu & Süre:** Yazı açıldığında kelime sayısına göre tahmini okuma süresi (`dk okuma`) hesaplanır ve siz aşağı kaydırdıkça üstteki ilerleme çubuğu dolar.
- **Anlık Arama:** Ziyaretçiler *Yazılar* bölümündeki arama kutusundan başlık, özet ve kategori bazında anlık filtreleme yapabilir.
- **Hazır HTML Şablonları:** Kopyala-yapıştır yapmak isterseniz [BLOGGER_TEMPLATES.md](./BLOGGER_TEMPLATES.md) dosyasına bakabilirsiniz.

---

## 5. Sürüm Geçmişi ve Eski Sürüme Dönüş

GitHub deposundaki her onaylı sürüm kalıcı **Git Tag** ile işaretlenir (`v1.0.6`, `v1.0.7`, `v1.0.8` ...). İstediğiniz zaman GitHub'da ilgili etiketi seçerek o sürümün `theme.xml` dosyasına geri dönebilirsiniz.
