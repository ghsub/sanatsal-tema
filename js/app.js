/**
 * Sanatsal Tema — Headless Blogger Security, Parser & Interaction Engine
 * Zero-PII Architecture: No personal data is stored in this script.
 */
(function () {
  'use strict';

  const appRoot = document.getElementById('app');
  if (!appRoot) return;

  const BOTS_URL = appRoot.dataset.botsUrl || './security/bots.json';
  const CATEGORIES = [
    'Tümü',
    'Mühendislik Notları',
    'Fotoğrafçılık',
    'Gezi',
    'Otomotiv/Mekanik'
  ];
  const GALLERY_PAGE_SIZE = 12;

  const state = {
    isBot: false,
    userInteracted: false,
    sensitiveRendered: false,
    activeCategory: 'Tümü',
    galleryLimit: GALLERY_PAGE_SIZE,
    lightboxIndex: 0,
    data: {
      profile: null,
      resume: [],
      portfolio: [],
      articles: [],
      gallery: [],
      contact: null
    }
  };

  /* ========================================================================
     1. Theme Management (Light / Dark)
     ======================================================================== */
  function initTheme() {
    const saved = localStorage.getItem('sanatsal-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sanatsal-theme', next);
        updateThemeIcon(next);
      });
    }
  }

  function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
    toggleBtn.textContent = theme === 'dark' ? '☀' : '☾';
  }

  /* ========================================================================
     2. Mobile Navigation
     ======================================================================== */
  function initMobileNav() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========================================================================
     3. Multi-Layer Anti-Bot & Behavioral Shield
     ======================================================================== */
  async function evaluateBotStatus() {
    if (navigator.webdriver === true) {
      return true;
    }

    const ua = (navigator.userAgent || '').toLowerCase();
    try {
      const resp = await fetch(BOTS_URL, { cache: 'default' });
      if (resp.ok) {
        const botList = await resp.json();
        if (Array.isArray(botList)) {
          for (let i = 0; i < botList.length; i++) {
            const sig = String(botList[i]).trim().toLowerCase();
            if (sig && ua.includes(sig)) {
              return true;
            }
          }
        }
      }
    } catch (_) {
      // Fail open for legitimate browsers if offline/blocked, webdriver check still holds
    }
    return false;
  }

  function setupBehavioralGate() {
    if (state.isBot) {
      renderShieldNotice('ozgecmis-content', 'Otomatik erişim algılandı. Özgeçmiş verisi güvenlik kalkanı tarafından gizlendi.');
      renderShieldNotice('galeri-content', 'Otomatik erişim algılandı. Galeri içeriği güvenlik kalkanı tarafından gizlendi.');
      renderShieldNotice('iletisim-content', 'Otomatik erişim algılandı. İletişim bilgileri güvenlik kalkanı tarafından gizlendi.');
      return;
    }

    renderShieldNotice('ozgecmis-content', 'İçerik Doğrulaması Bekleniyor — Görüntülemek için sayfada hareket edin veya kaydırın.');
    renderShieldNotice('galeri-content', 'Medya Kalkanı Aktif — Galeriyi yüklemek için sayfada hareket edin veya kaydırın.');
    renderShieldNotice('iletisim-content', 'Bot Koruması Aktif — İletişim kanallarını görmek için etkileşim bekleniyor.');

    const triggerEvents = ['mousemove', 'scroll', 'touchstart', 'keydown', 'pointerdown'];
    const onHumanSignal = function () {
      if (state.userInteracted || state.isBot) return;
      state.userInteracted = true;
      triggerEvents.forEach(function (evt) {
        window.removeEventListener(evt, onHumanSignal, { passive: true });
      });
      renderSensitiveSections();
    };

    triggerEvents.forEach(function (evt) {
      window.addEventListener(evt, onHumanSignal, { passive: true });
    });
  }

  function renderShieldNotice(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'shield-notice';
    const title = document.createElement('strong');
    title.textContent = 'Güvenlik Kalkanı';
    const p = document.createElement('span');
    p.textContent = message;
    box.appendChild(title);
    box.appendChild(p);
    el.appendChild(box);
  }

  /* ========================================================================
     4. Right-Click & Keyboard Shortcut Deterrence
     ======================================================================== */
  function initDeterrence() {
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    document.addEventListener('dragstart', function (e) {
      if (e.target.tagName === 'IMG' || e.target.closest('.media-shield')) {
        e.preventDefault();
      }
    });

    document.addEventListener('keydown', function (e) {
      const active = document.activeElement;
      const isFormField = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        active.isContentEditable
      );
      if (isFormField) return;

      if ((e.ctrlKey || e.metaKey) && ['u', 's', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
  }

  /* ========================================================================
     5. Helpers: Sanitization, Slugify, Full-Res Blogger URLs, Reading Time
     ======================================================================== */
  function stripTags(html) {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(String(html), 'text/html');
      const text = (doc.body && doc.body.textContent) || '';
      const esc = document.createElement('div');
      esc.textContent = text;
      return esc.innerHTML;
    } catch (_) {
      return String(html).replace(/<[^>]*>/g, '');
    }
  }

  function sanitizeHTML(dirty) {
    if (!dirty) return '';
    if (typeof window.DOMPurify !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(dirty, {
        ADD_ATTR: ['loading', 'target', 'rel']
      });
    }
    return stripTags(dirty);
  }

  function slugify(text) {
    const trMap = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u'
    };
    return String(text || '')
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, function (ch) { return trMap[ch] || ch; })
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'yazi';
  }

  function upgradeBloggerImageUrl(url) {
    if (!url || url.startsWith('data:')) return url;
    return url
      .replace(/\/s\d+(?:-c)?\//g, '/s1600/')
      .replace(/\/w\d+-h\d+[^/]*\//g, '/s1600/')
      .replace(/=s\d+(?:-c)?$/g, '=s1600')
      .replace(/=w\d+-h\d+.*$/g, '=s1600');
  }

  function enhanceImagesInHtml(html) {
    const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
    doc.querySelectorAll('img').forEach(function (img) {
      const src = img.getAttribute('src');
      if (src) {
        img.setAttribute('src', upgradeBloggerImageUrl(src));
      }
      img.setAttribute('loading', 'lazy');
      img.setAttribute('draggable', 'false');
    });
    return doc.body.innerHTML;
  }

  function estimateReadingTime(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = sanitizeHTML(html);
    const words = (tmp.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function extractPlainExcerpt(html, maxLen) {
    const tmp = document.createElement('div');
    tmp.innerHTML = sanitizeHTML(html);
    const text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trim() + '…';
  }

  function formatDateTR(isoStr) {
    if (!isoStr) return '';
    try {
      return new Date(isoStr).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) {
      return isoStr;
    }
  }

  /* ========================================================================
     6. Data Loading: Blogger Relative JSON Feed vs Local Fallback
     ======================================================================== */
  function isLocalEnvironment() {
    const proto = window.location.protocol;
    const host = window.location.hostname;
    return proto === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '';
  }

  async function loadContentData() {
    if (isLocalEnvironment()) {
      return buildFallbackData();
    }

    try {
      const resp = await fetch('/feeds/posts/default?alt=json&max-results=150', {
        credentials: 'same-origin'
      });
      if (!resp.ok) throw new Error('Feed HTTP ' + resp.status);
      const json = await resp.json();
      return parseBloggerFeed(json);
    } catch (err) {
      console.warn('Blogger feed alınamadı, yerel güvenlik moduna geçildi:', err);
      return buildFallbackData();
    }
  }

  function parseBloggerFeed(json) {
    const entries = (json && json.feed && Array.isArray(json.feed.entry)) ? json.feed.entry : [];
    const parsed = {
      profile: {
        name: 'Editoryal & Akademik Arşiv',
        role: 'Araştırma Notları, Projeler ve Görsel Seçkiler',
        bioHtml: '<p>Hoş geldiniz. Bu alanda yayınlanan teknik notlar, projeler ve görsel seçkiler dinamik olarak sunulmaktadır. Kişisel profil vitrinini özelleştirmek için Blogger panelinde <code>Hakkimda</code> etiketli bir yayın oluşturabilirsiniz.</p>',
        skills: ['Sistem Mimarisi', 'Uygulama Güvenliği', 'Araştırma'],
        meta: []
      },
      resume: [],
      portfolio: [],
      articles: [],
      gallery: [],
      contact: {
        note: 'Mesajlarınız ve akademik iş birlikleri için aşağıdaki kanallardan ulaşabilirsiniz.',
        socials: [],
        encodedEmail: ''
      }
    };

    entries.forEach(function (entry) {
      const title = (entry.title && entry.title.$t) || 'Başlıksız';
      const rawHtml = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
      const published = (entry.published && entry.published.$t) || '';
      const labels = Array.isArray(entry.category)
        ? entry.category.map(function (c) { return c.term; })
        : [];

      if (labels.some(function (l) { return l.toLowerCase() === 'hakkimda'; })) {
        parsed.profile = parseProfileEntry(title, rawHtml, parsed.profile.name);
        const contactExtracted = parseContactFromHtml(rawHtml);
        if (contactExtracted.socials.length || contactExtracted.encodedEmail) {
          parsed.contact = contactExtracted;
        }
        return;
      }

      if (labels.includes('Ozgecmis')) {
        parsed.resume = parseResumeEntry(rawHtml);
        return;
      }

      if (labels.includes('Iletisim')) {
        parsed.contact = parseContactFromHtml(rawHtml);
        return;
      }

      if (labels.includes('Galeri')) {
        const imgs = extractGalleryImages(rawHtml, title);
        parsed.gallery = parsed.gallery.concat(imgs);
        return;
      }

      if (labels.includes('Portfolyo')) {
        parsed.portfolio.push({
          id: slugify(title),
          slug: slugify(title),
          title: title,
          category: labels.find(function (l) { return l !== 'Portfolyo'; }) || 'Proje',
          date: formatDateTR(published),
          excerpt: extractPlainExcerpt(rawHtml, 160),
          html: enhanceImagesInHtml(rawHtml)
        });
        return;
      }

      const articleCat = labels.find(function (l) {
        return CATEGORIES.includes(l) && l !== 'Tümü';
      }) || 'Mühendislik Notları';

      parsed.articles.push({
        id: slugify(title),
        slug: slugify(title),
        title: title,
        category: articleCat,
        date: formatDateTR(published),
        readingTime: estimateReadingTime(rawHtml),
        excerpt: extractPlainExcerpt(rawHtml, 175),
        html: enhanceImagesInHtml(rawHtml)
      });
    });

    return parsed;
  }

  function parseProfileEntry(title, html, fallbackName) {
    const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
    const skills = [];
    doc.querySelectorAll('ul li').forEach(function (li) {
      const txt = li.textContent.trim();
      if (txt) skills.push(txt);
    });
    doc.querySelectorAll('ul').forEach(function (ul) { ul.remove(); });

    const roleEl = doc.querySelector('h2, h3');
    const role = roleEl ? roleEl.textContent.trim() : 'Akademik & Teknik Profil';
    if (roleEl) roleEl.remove();

    return {
      name: title || fallbackName,
      role: role,
      bioHtml: doc.body.innerHTML,
      skills: skills.length ? skills : ['Araştırma', 'Mühendislik', 'Tasarım'],
      meta: [
        { label: 'Odak', value: role },
        { label: 'Mimari', value: 'Zero-PII Headless CMS' }
      ]
    };
  }

  function parseResumeEntry(html) {
    const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
    const items = [];

    // Support structured <li> items: "2022–2026 | Başlık | Kurum | Açıklama"
    doc.querySelectorAll('li, p').forEach(function (node) {
      const text = node.textContent.trim();
      if (!text) return;
      if (text.includes('|')) {
        const parts = text.split('|').map(function (p) { return p.trim(); });
        items.push({
          period: parts[0] || '',
          title: parts[1] || '',
          org: parts[2] || '',
          desc: parts[3] || ''
        });
      }
    });

    if (!items.length) {
      doc.querySelectorAll('h3, h4').forEach(function (h) {
        const nextP = h.nextElementSibling;
        items.push({
          period: 'Dönem',
          title: h.textContent.trim(),
          org: '',
          desc: nextP ? nextP.textContent.trim() : ''
        });
      });
    }
    return items;
  }

  function parseContactFromHtml(html) {
    const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
    const socials = [];
    let encodedEmail = '';

    doc.querySelectorAll('a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('mailto:')) {
        encodedEmail = btoa(href.replace(/^mailto:/i, '').trim());
      } else if (href.startsWith('http')) {
        socials.push({ label: a.textContent.trim() || 'Bağlantı', url: href });
      }
    });

    const emailAttr = doc.querySelector('[data-encoded-email]');
    if (emailAttr) {
      encodedEmail = emailAttr.getAttribute('data-encoded-email') || encodedEmail;
    }

    return {
      note: 'Akademik iş birlikleri, teknik değerlendirmeler ve fotoğraf projeleri için ulaşabilirsiniz.',
      socials: socials,
      encodedEmail: encodedEmail
    };
  }

  function extractGalleryImages(html, postTitle) {
    const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
    const imgs = [];
    doc.querySelectorAll('img').forEach(function (img, idx) {
      const src = img.getAttribute('src');
      if (!src) return;
      imgs.push({
        src: upgradeBloggerImageUrl(src),
        alt: img.getAttribute('alt') || (postTitle + ' — Kare ' + (idx + 1)),
        caption: img.getAttribute('title') || img.getAttribute('alt') || postTitle
      });
    });
    return imgs;
  }

  /* ========================================================================
     7. Fictional / Anonymous Local Fallback Data (Zero-PII)
     ======================================================================== */
  function makeSvgPhoto(title, bgHex, accentHex) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="${bgHex}"/>
      <circle cx="580" cy="170" r="90" fill="${accentHex}" opacity="0.28"/>
      <path d="M0 440 L240 270 L450 400 L630 240 L800 390 L800 600 L0 600 Z" fill="${accentHex}" opacity="0.45"/>
      <text x="48" y="540" font-family="Georgia, serif" font-size="26" fill="#FAF9F6" opacity="0.9">${title}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function buildFallbackData() {
    const galleryItems = [];
    const palette = [
      ['#243447', '#A84432'],
      ['#2B3A2E', '#C48F5A'],
      ['#3A2D28', '#7FA3D1'],
      ['#1F2A36', '#B86B52']
    ];
    for (let i = 1; i <= 15; i++) {
      const pair = palette[(i - 1) % palette.length];
      galleryItems.push({
        src: makeSvgPhoto('Örnek Seri #' + i, pair[0], pair[1]),
        alt: 'Kurgusal Galeri Fotoğrafı ' + i,
        caption: 'Örnek Fotoğraf Çalışması #' + i + ' — 50mm f/2.0 (Önizleme)'
      });
    }

    return {
      profile: {
        name: 'Dr. Deniz Kaya',
        role: 'Makine & Sistem Mühendisi',
        bioHtml: '<p>Bu alan yerel önizleme modunda (<code>preview.html</code>) çalışan tamamen kurgusal bir profil örneğidir. Gerçek yayın ortamında içerikler yalnızca Blogger JSON beslemesinden dinamik olarak çekilir.</p><p>Araştırma odağı; termodinamik verimlilik, akışkanlar mekaniği, otonom kontrol sistemleri ve belgesel fotoğrafçılık üzerinedir.</p>',
        skills: ['Termodinamik', 'Akışkanlar Mekaniği', 'Kontrol Sistemleri', 'AppSec Mimarisi', 'Belgesel Fotoğrafçılık'],
        meta: [
          { label: 'Unvan', value: 'Makine & Sistem Mühendisi' },
          { label: 'Konum', value: 'Önizleme Ortamı' },
          { label: 'Gizlilik Politikası', value: 'Zero-PII / No-Archive' }
        ]
      },
      resume: [
        {
          period: '2023 – Günümüz',
          title: 'Baş Sistem Güvenliği & Kontrol Mimarı',
          org: 'Örnek Araştırma Enstitüsü',
          desc: 'Başsız içerik mimarileri, deterministik kontrol hatları ve istemci tarafı güvenlik doğrulama sistemleri.'
        },
        {
          period: '2019 – 2023',
          title: 'Doktora Araştırmacısı — Makine & Sistem Mühendisliği',
          org: 'Örnek Teknik Üniversitesi',
          desc: 'Doğrusal olmayan dinamik sistemlerde sensör füzyonu, ısı transferi optimizasyonu ve gürbüz durum kestirimi.'
        },
        {
          period: '2016 – 2019',
          title: 'Ar-Ge Mühendisi',
          org: 'Örnek Teknoloji Laboratuvarı',
          desc: 'Gerçek zamanlı telemetri sistemleri ve düşük gecikmeli veri toplama donanımları.'
        }
      ],
      portfolio: [
        {
          id: 'ornek-proje-sensor-fuzyonu',
          slug: 'ornek-proje-sensor-fuzyonu',
          title: 'Örnek Proje: Otonom Sensör Füzyonu',
          category: 'Gömülü Sistemler',
          date: '10 Kasım 2026',
          excerpt: 'IMU ve optik akış verilerini Kalman filtresi ile birleştiren düşük güçlü durum kestirim modülü.',
          html: '<h1>Örnek Proje: Otonom Sensör Füzyonu</h1><p>Bu proje kartı kurgusal bir portfolyo örneğidir. Donanım maliyeti yaklaşık $120 altında tutularak yüksek kararlılık hedeflenmiştir.</p><p>Matematiksel durum güncelleme denklemi aşağıdadır:</p>$$\\hat{x}_{k|k} = \\hat{x}_{k|k-1} + K_k (z_k - H\\hat{x}_{k|k-1})$$<p>Satır içi örnek: \\( P_{k|k} = (I - K_k H) P_{k|k-1} \\) şeklinde kovaryans güncellenir.</p>'
        },
        {
          id: 'ornek-proje-zero-pii-cms',
          slug: 'ornek-proje-zero-pii-cms',
          title: 'Örnek Proje: Zero-PII İstemci Kalkanı',
          category: 'Uygulama Güvenliği',
          date: '24 Ekim 2026',
          excerpt: 'Statik kod deposunda sıfır kişisel veri barındıran, SRI ve CSP ile sertleştirilmiş başsız yayın altyapısı.',
          html: '<h1>Örnek Proje: Zero-PII İstemci Kalkanı</h1><p>Tüm harici bağımlılıklar Subresource Integrity (SRI) ile doğrulanır ve kullanıcı etkileşimi olmadan hassas DOM düğümleri oluşturulmaz.</p>'
        }
      ],
      articles: [
        {
          id: 'termodinamik-verimlilik-ve-butce-analizi',
          slug: 'termodinamik-verimlilik-ve-butce-analizi',
          title: 'Termodinamik Verimlilik, Süreklilik Denklemi ve $120 Altı Sensör Bütçesi',
          category: 'Mühendislik Notları',
          date: '12 Kasım 2026',
          readingTime: 4,
          excerpt: 'Carnot verimliliği, süreklilik denklemi ve $120 bütçeli düşük maliyetli telemetri sensörlerinin kalibrasyonu.',
          html: '<h1>Termodinamik Verimlilik, Süreklilik Denklemi ve $120 Altı Sensör Bütçesi</h1><p>Mühendislik prototiplerinde sensör paketi maliyeti $120 sınırının altında tutulduğunda, yazılımsal kalibrasyon ve fiziksel modelleme kritik önem taşır. Metin içindeki $120 gibi para birimi ifadeleri KaTeX motoruyla çakışmaz.</p><p>İdeal bir ısı makinesinin teorik maksimum verimliliği satır içi olarak \\( \\eta = 1 - \\frac{T_c}{T_h} \\) bağıntısıyla hesaplanır.</p><p>Sıkıştırılamaz veya genel akışkanlar için kütle korunumu (süreklilik denklemi) blok formül olarak aşağıdadır:</p>$$\\nabla \\cdot (\\rho \\mathbf{u}) = 0$$<p>Bu temel denklemler, düşük maliyetli donanımlardan elde edilen verilerin fiziksel tutarlılığını doğrulamak için kullanılır.</p>'
        },
        {
          id: 'sabah-isiginda-orta-format-denemeleri',
          slug: 'sabah-isiginda-orta-format-denemeleri',
          title: 'Sabah Işığında Orta Format ve Alan Derinliği',
          category: 'Fotoğrafçılık',
          date: '02 Kasım 2026',
          readingTime: 3,
          excerpt: 'Düşük kontrastlı sisli sabahlarda 80mm odak uzaklığıyla mimari ve doğal doku çalışmaları.',
          html: '<h1>Sabah Işığında Orta Format ve Alan Derinliği</h1><p>Bu yazı kurgusal bir fotoğrafçılık notudur. Işığın yatay açıyla düştüğü erken saatlerde gölge detaylarını korumak için pozlama telafisi uygulanmıştır.</p>'
        },
        {
          id: 'kuzey-yaylalarinda-uc-gunluk-rota',
          slug: 'kuzey-yaylalarinda-uc-gunluk-rota',
          title: 'Kuzey Yaylalarında Üç Günlük Yürüyüş Rotası',
          category: 'Gezi',
          date: '18 Ekim 2026',
          readingTime: 5,
          excerpt: 'Yüksek irtifa patikalarında kamp ekipmanı ağırlık optimizasyonu ve rota notları.',
          html: '<h1>Kuzey Yaylalarında Üç Günlük Yürüyüş Rotası</h1><p>Kurgusal gezi günlüğü: 2400 metre rakımda hava değişimleri hızlı olduğundan katmanlı giyim ve su geçirmez harita kılıfı temel gereksinimler arasındadır.</p>'
        },
        {
          id: 'atmosferik-motorda-emme-manifoldu-rezonansi',
          slug: 'atmosferik-motorda-emme-manifoldu-rezonansi',
          title: 'Atmosferik Motorda Emme Manifoldu Helmholtz Rezonansı',
          category: 'Otomotiv/Mekanik',
          date: '05 Ekim 2026',
          readingTime: 4,
          excerpt: 'Değişken uzunluklu emme kanallarının hacimsel verimlilik ve tork eğrisi üzerindeki etkileri.',
          html: '<h1>Atmosferik Motorda Emme Manifoldu Helmholtz Rezonansı</h1><p>Emme borusu uzunluğu ve plenum hacmi, belirli devir aralıklarında basınç dalgalarının supap açılma anıyla eşleşmesini sağlar:</p>$$f_H = \\frac{c}{2\\pi} \\sqrt{\\frac{A}{V \\cdot L_{eff}}}$$<p>Burada \\( c \\) ses hızını, \\( A \\) kesit alanını, \\( V \\) silindir hacmini temsil eder.</p>'
        }
      ],
      gallery: galleryItems,
      contact: {
        note: 'Bu bölüm önizleme amaçlı kurgusal veriler içerir. E-posta adresi HTML kaynak kodunda düz metin olarak yer almaz.',
        socials: [
          { label: 'GitHub', url: 'https://github.com/ghsub/sanatsal-tema' },
          { label: 'ORCID (Örnek)', url: 'https://orcid.org/' },
          { label: 'Mastodon (Örnek)', url: 'https://mastodon.social/' }
        ],
        // Base64 encoded fictional email: iletisim@ornek-akademi.invalid
        encodedEmail: 'aWxldGlzaW1Ab3JuZWstYWthZGVtaS5pbnZhbGlk'
      }
    };
  }

  /* ========================================================================
     8. Rendering Functions
     ======================================================================== */
  function renderPublicSections() {
    renderProfile();
    renderPortfolio();
    renderCategoryFilters();
    renderArticles();
  }

  function renderSensitiveSections() {
    if (state.sensitiveRendered || state.isBot) return;
    state.sensitiveRendered = true;
    renderResume();
    renderGallery();
    renderContact();
  }

  function renderProfile() {
    const p = state.data.profile;
    if (!p) return;

    const nameEl = document.getElementById('hero-name');
    const roleEl = document.getElementById('hero-role');
    const bioEl = document.getElementById('hero-bio');
    const skillsEl = document.getElementById('hero-skills');
    const metaEl = document.getElementById('hero-meta-list');

    if (nameEl) nameEl.textContent = p.name;
    if (roleEl) roleEl.textContent = p.role;
    if (bioEl) bioEl.innerHTML = sanitizeHTML(p.bioHtml);

    if (skillsEl) {
      skillsEl.innerHTML = '';
      p.skills.forEach(function (skill) {
        const span = document.createElement('span');
        span.className = 'skill-badge';
        span.textContent = skill;
        skillsEl.appendChild(span);
      });
    }

    if (metaEl) {
      metaEl.innerHTML = '';
      const catalogStats = [
        { label: 'Toplam Yazı', value: state.data.articles.length + ' Makale' },
        { label: 'Portfolyo Projesi', value: state.data.portfolio.length + ' Proje' },
        { label: 'Galeri Fotoğrafı', value: state.data.gallery.length + ' Kare' }
      ];
      catalogStats.forEach(function (m) {
        const li = document.createElement('li');
        li.className = 'hero-meta-item';
        const lbl = document.createElement('span');
        lbl.className = 'hero-meta-label';
        lbl.textContent = m.label;
        const val = document.createElement('span');
        val.className = 'hero-meta-value';
        val.textContent = m.value;
        li.appendChild(lbl);
        li.appendChild(val);
        metaEl.appendChild(li);
      });
    }
  }

  function renderResume() {
    const container = document.getElementById('ozgecmis-content');
    if (!container) return;
    const items = state.data.resume;

    if (!items.length) {
      container.innerHTML = '<p class="section-subtitle">Henüz özgeçmiş kaydı eklenmemiş.</p>';
      return;
    }

    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    items.forEach(function (item) {
      const card = document.createElement('article');
      card.className = 'timeline-item';

      if (item.period) {
        const period = document.createElement('div');
        period.className = 'timeline-period';
        period.textContent = item.period;
        card.appendChild(period);
      }

      const title = document.createElement('h3');
      title.className = 'timeline-title';
      title.textContent = item.title;
      card.appendChild(title);

      if (item.org) {
        const org = document.createElement('div');
        org.className = 'timeline-org';
        org.textContent = item.org;
        card.appendChild(org);
      }

      if (item.desc) {
        const desc = document.createElement('p');
        desc.className = 'timeline-desc';
        desc.textContent = item.desc;
        card.appendChild(desc);
      }

      timeline.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(timeline);
  }

  function renderPortfolio() {
    const container = document.getElementById('portfolyo-grid');
    if (!container) return;
    container.innerHTML = '';

    const items = state.data.portfolio;
    if (!items.length) {
      container.innerHTML = '<p class="section-subtitle">Henüz portfolyo projesi eklenmemiş.</p>';
      return;
    }

    items.forEach(function (proj) {
      const card = createEditorialCard(proj, 'Projeyi İncele →');
      container.appendChild(card);
    });
  }

  function renderCategoryFilters() {
    const bar = document.getElementById('yazilar-filters');
    if (!bar) return;
    bar.innerHTML = '';

    CATEGORIES.forEach(function (cat) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (state.activeCategory === cat ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', function () {
        state.activeCategory = cat;
        renderCategoryFilters();
        renderArticles();
      });
      bar.appendChild(btn);
    });
  }

  function renderArticles() {
    const container = document.getElementById('yazilar-grid');
    if (!container) return;
    container.innerHTML = '';

    const filtered = state.activeCategory === 'Tümü'
      ? state.data.articles
      : state.data.articles.filter(function (a) { return a.category === state.activeCategory; });

    if (!filtered.length) {
      container.innerHTML = '<p class="section-subtitle">Bu kategoride henüz yazı bulunmuyor.</p>';
      return;
    }

    filtered.forEach(function (article) {
      const card = createEditorialCard(article, 'Makaleyi Oku →');
      container.appendChild(card);
    });
  }

  function createEditorialCard(item, ctaText) {
    const card = document.createElement('article');
    card.className = 'editorial-card protected-content';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    const top = document.createElement('div');
    const metaRow = document.createElement('div');
    metaRow.className = 'card-meta-row';

    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.textContent = item.category;

    const rightMeta = document.createElement('span');
    rightMeta.textContent = item.readingTime
      ? item.date + ' · ' + item.readingTime + ' dk okuma'
      : item.date;

    metaRow.appendChild(tag);
    metaRow.appendChild(rightMeta);

    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = item.title;

    const excerpt = document.createElement('p');
    excerpt.className = 'card-excerpt';
    excerpt.textContent = item.excerpt;

    top.appendChild(metaRow);
    top.appendChild(h3);
    top.appendChild(excerpt);

    const footer = document.createElement('span');
    footer.className = 'card-footer-link';
    footer.textContent = ctaText;

    card.appendChild(top);
    card.appendChild(footer);

    const openHandler = function () { openReaderModal(item); };
    card.addEventListener('click', openHandler);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHandler();
      }
    });

    return card;
  }

  function renderGallery() {
    const container = document.getElementById('galeri-content');
    if (!container) return;
    container.innerHTML = '';

    const items = state.data.gallery;
    if (!items.length) {
      container.innerHTML = '<p class="section-subtitle">Henüz galeri fotoğrafı eklenmemiş.</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    const visibleItems = items.slice(0, state.galleryLimit);
    visibleItems.forEach(function (photo, idx) {
      const item = document.createElement('div');
      item.className = 'gallery-item media-shield';
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', photo.caption || 'Fotoğrafı büyüt');

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.draggable = false;

      const cap = document.createElement('div');
      cap.className = 'gallery-caption-bar';
      cap.textContent = photo.caption;

      item.appendChild(img);
      item.appendChild(cap);

      const openLb = function () { openLightbox(idx); };
      item.addEventListener('click', openLb);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLb();
        }
      });

      grid.appendChild(item);
    });

    container.appendChild(grid);

    if (items.length > state.galleryLimit) {
      const actions = document.createElement('div');
      actions.className = 'gallery-actions';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-secondary';
      btn.textContent = 'Daha Fazla Yükle (' + (items.length - state.galleryLimit) + ' fotoğraf daha)';
      btn.addEventListener('click', function () {
        state.galleryLimit += GALLERY_PAGE_SIZE;
        renderGallery();
      });
      actions.appendChild(btn);
      container.appendChild(actions);
    }
  }

  function renderContact() {
    const container = document.getElementById('iletisim-content');
    if (!container) return;
    const c = state.data.contact;
    if (!c) return;

    const panel = document.createElement('div');
    panel.className = 'contact-panel';

    const left = document.createElement('div');
    const note = document.createElement('p');
    note.className = 'section-subtitle';
    note.textContent = c.note;
    left.appendChild(note);

    const socials = document.createElement('div');
    socials.className = 'social-links';
    (c.socials || []).forEach(function (s) {
      const a = document.createElement('a');
      a.className = 'social-pill';
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = s.label;
      socials.appendChild(a);
    });
    left.appendChild(socials);

    const right = document.createElement('div');
    right.className = 'email-shield-box';
    const lbl = document.createElement('span');
    lbl.className = 'email-shield-label';
    lbl.textContent = 'Bot Korumalı E-Posta';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-primary';
    btn.textContent = 'E-Posta Adresini Çöz';

    const out = document.createElement('div');
    out.className = 'revealed-email';

    btn.addEventListener('click', function () {
      if (!c.encodedEmail) {
        out.textContent = 'Blogger üzerinde tanımlı e-posta bulunamadı.';
        return;
      }
      try {
        const decoded = atob(c.encodedEmail);
        out.innerHTML = '';
        const mailLink = document.createElement('a');
        mailLink.href = 'mai' + 'lto:' + decoded;
        mailLink.textContent = decoded;
        out.appendChild(mailLink);
        btn.disabled = true;
        btn.textContent = 'Doğrulandı';
      } catch (_) {
        out.textContent = 'Adres çözülemedi.';
      }
    });

    right.appendChild(lbl);
    right.appendChild(btn);
    right.appendChild(out);

    panel.appendChild(left);
    panel.appendChild(right);

    container.innerHTML = '';
    container.appendChild(panel);
  }

  /* ========================================================================
     9. Reader Modal, KaTeX Engine & Hash Routing
     ======================================================================== */
  function openReaderModal(item) {
    const backdrop = document.getElementById('reader-modal');
    const metaEl = document.getElementById('reader-modal-meta');
    const bodyEl = document.getElementById('reader-modal-body');
    if (!backdrop || !bodyEl) return;

    if (metaEl) {
      metaEl.textContent = item.readingTime
        ? item.category + ' · ' + item.date + ' · ' + item.readingTime + ' dk okuma'
        : item.category + ' · ' + item.date;
    }

    bodyEl.innerHTML = sanitizeHTML(item.html);

    if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(bodyEl, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + item.slug);
    }
  }

  function closeReaderModal() {
    const backdrop = document.getElementById('reader-modal');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function openLightbox(index) {
    const backdrop = document.getElementById('lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    const items = state.data.gallery;
    if (!backdrop || !imgEl || !items.length) return;

    state.lightboxIndex = (index + items.length) % items.length;
    const current = items[state.lightboxIndex];
    imgEl.src = current.src;
    imgEl.alt = current.alt;
    if (capEl) {
      capEl.textContent = current.caption + ' (' + (state.lightboxIndex + 1) + ' / ' + items.length + ')';
    }

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const backdrop = document.getElementById('lightbox-modal');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals() {
    const readerBackdrop = document.getElementById('reader-modal');
    const readerClose = document.getElementById('reader-modal-close');
    if (readerClose) readerClose.addEventListener('click', closeReaderModal);
    if (readerBackdrop) {
      readerBackdrop.addEventListener('click', function (e) {
        if (e.target === readerBackdrop) closeReaderModal();
      });
    }

    const lbBackdrop = document.getElementById('lightbox-modal');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(state.lightboxIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { openLightbox(state.lightboxIndex + 1); });
    if (lbBackdrop) {
      lbBackdrop.addEventListener('click', function (e) {
        if (e.target === lbBackdrop) closeLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeReaderModal();
        closeLightbox();
      } else if (lbBackdrop && lbBackdrop.classList.contains('open')) {
        if (e.key === 'ArrowLeft') openLightbox(state.lightboxIndex - 1);
        if (e.key === 'ArrowRight') openLightbox(state.lightboxIndex + 1);
      }
    });
  }

  function handleInitialHashRoute() {
    const rawHash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!rawHash) return;

    const allItems = state.data.articles.concat(state.data.portfolio);
    const match = allItems.find(function (item) { return item.slug === rawHash; });
    if (match) {
      openReaderModal(match);
    }
  }

  /* ========================================================================
     10. Bootstrap
     ======================================================================== */
  function ensureDOMPurify() {
    if (typeof window.DOMPurify !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      const s = document.createElement('script');
      s.src = isLocalEnvironment()
        ? './js/purify.min.js'
        : 'https://cdn.jsdelivr.net/gh/ghsub/sanatsal-tema@main/js/purify.min.js?v=1.0.6';
      s.crossOrigin = 'anonymous';
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (isLocalEnvironment()) {
      const previewBanner = document.getElementById('local-preview-banner');
      if (previewBanner) previewBanner.hidden = false;
    }

    initTheme();
    initMobileNav();
    initDeterrence();
    initModals();

    const [botDetected, loadedData] = await Promise.all([
      evaluateBotStatus(),
      loadContentData(),
      ensureDOMPurify()
    ]);

    state.isBot = botDetected;
    state.data = loadedData;

    renderPublicSections();
    setupBehavioralGate();
    handleInitialHashRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
