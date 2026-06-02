(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const themeKey = 'al_samaei_theme';

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
  }
  function initThemeToggle() {
    const btn = $('#themeToggle');
    if (!btn) return;

    let theme = 'dark';
    try {
      theme = localStorage.getItem(themeKey) || 'dark';
    } catch (e) {}

    applyTheme(theme);
    btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');

    const updateIcon = () => {
      btn.textContent = (theme === 'light') ? '☀️' : '🌙';
    };
    updateIcon();

    btn.addEventListener('click', () => {
      theme = (theme === 'dark') ? 'light' : 'dark';
      try { localStorage.setItem(themeKey, theme); } catch (e) {}
      applyTheme(theme);
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      updateIcon();
    });
  }

  // ---------- Loading screen ----------
  function initLoading() {
    const overlay = $('#loading');
    if (!overlay) return;
    window.addEventListener('load', () => {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    });
  }

  // ---------- Mobile menu ----------
  function initMobileMenu() {
    const toggle = $('#mobileToggle');
    const panel = $('#mobilePanel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const open = panel.getAttribute('data-open') === 'true';
      panel.setAttribute('data-open', open ? 'false' : 'true');
      panel.style.display = open ? 'none' : 'block';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    // Close on link click
    $$('.mobile-panel a').forEach(a => {
      a.addEventListener('click', () => {
        panel.style.display = 'none';
        panel.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // default
    panel.style.display = 'none';
    panel.setAttribute('data-open', 'false');
  }

  // ---------- Active nav ----------
  function initActiveNav() {
    const links = $$('.nav-links a');
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href && href.endsWith(path)) a.classList.add('active');
      // also allow exact match
      if (href && href === path) a.classList.add('active');
    });
  }

  // ---------- Scroll reveal ----------
  function initReveal() {
    const nodes = $$('.reveal');
    if (!nodes.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { threshold: 0.14 });

    nodes.forEach(n => io.observe(n));
  }

  // ---------- Back to top ----------
  function initToTop() {
    const box = $('#toTop');
    if (!box) return;
    const btn = box.querySelector('button');

    const onScroll = () => {
      if (window.scrollY > 500) box.style.display = 'block';
      else box.style.display = 'none';
    };
    window.addEventListener('scroll', onScroll);
    onScroll();

    btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------- Toast ----------
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      t.style.display = 'none';
    }, 2400);
  }

  // ---------- Animated counters ----------
  function formatNumber(n) {
    return new Intl.NumberFormat(undefined).format(n);
  }

  function animateCounter(el, to, duration = 1300) {
    const from = 0;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.floor(from + (to - from) * (t * (2 - t))); // easeOutQuad
      el.textContent = formatNumber(val);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = $$('.counter[data-value]');
    if (!counters.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.ran) {
          e.target.dataset.ran = 'true';
          const to = Number(e.target.dataset.value) || 0;
          animateCounter(e.target, to);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => io.observe(c));
  }

  // ---------- Animated typing headline ----------
  function initTyping() {
    const el = $('#typing');
    if (!el) return;
    const words = (el.dataset.words || '').split('|').map(s => s.trim()).filter(Boolean);
    if (!words.length) return;

    let i = 0;
    let char = 0;
    let deleting = false;
    const speed = Number(el.dataset.speed || 44);

    const tick = () => {
      const word = words[i];
      if (!deleting) {
        char++;
        el.textContent = word.slice(0, char);
        if (char >= word.length) {
          deleting = true;
          setTimeout(tick, 700);
          return;
        }
        setTimeout(tick, speed);
      } else {
        char--;
        el.textContent = word.slice(0, char);
        if (char <= 0) {
          deleting = false;
          i = (i + 1) % words.length;
          setTimeout(tick, 250);
          return;
        }
        setTimeout(tick, Math.max(18, speed - 10));
      }
    };
    el.textContent = '';
    tick();
  }

  // ---------- Stars ----------
  function starsHTML(rating) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.round(r * 2) / 2; // half steps
    const fullStars = Math.floor(full);
    const half = (fullStars + 0.5) <= full;

    let s = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) s += '★';
      else if (i === fullStars && half) s += '☆';
      else s += '✩';
    }
    // Use filled stars by CSS text color.
    return s.replace(/☆/g, '★');
  }

  // ---------- Testimonials slider ----------
  function initTestimonials() {
    const slider = $('#testimonialSlider');
    if (!slider) return;

    const track = $('#testimonialTrack');
    const dots = $$('.dot', slider);
    const prev = $('#testimonialPrev');
    const next = $('#testimonialNext');

    let index = 0;
    const total = track ? $$('.slide', track).length : 0;

    const set = (i) => {
      index = (i + total) % total;
      if (track) track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    };

    prev?.addEventListener('click', () => set(index - 1));
    next?.addEventListener('click', () => set(index + 1));

    dots.forEach((d, di) => d.addEventListener('click', () => set(di)));

    let timer = setInterval(() => set(index + 1), 5200);
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      timer = setInterval(() => set(index + 1), 5200);
    });

    set(0);
  }

  // ---------- Accordion ----------
  function initAccordion() {
    $$('.qa .qbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qa = btn.closest('.qa');
        if (!qa) return;
        const isOpen = qa.classList.contains('open');
        $$('.qa.open').forEach(x => x.classList.remove('open'));
        if (!isOpen) qa.classList.add('open');
      });
    });

    const search = $('#faqSearch');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        $$('.qa').forEach(qa => {
          const text = qa.textContent.toLowerCase();
          qa.style.display = !q || text.includes(q) ? '' : 'none';
        });
      });
    }
  }

  // ---------- Package engine (Hajj/Umrah/Tourism) ----------
  const PACKAGE_DATA = [
    {
      id: 'hajj-elite-1',
      category: 'hajj',
      title: 'Hajj Elite 14 Nights • Premium Stay',
      typeLabel: 'Hajj',
      priceFrom: 8990,
      durationDays: 14,
      groupSize: '8–12 Pax',
      hotel: '5★ Makkah & Madinah • Close to Masjid',
      transport: 'VIP Coach • Domestic Flights',
      highlights: [
        { k: 'Itinerary', v: 'Ihram, Tawaf, Sa’i, and guided rituals throughout.' },
        { k: 'Guidance', v: 'Certified Hajj instructors & group services.' },
        { k: 'Comfort', v: 'Luxury accommodation with daily assistance.' },
      ],
      features: ['Assisted check-in', 'Ziyarah schedule', '24/7 support'],
      img: 'assets/images/hajj.jpg'
    },
    {
      id: 'hajj-comfort-2',
      category: 'hajj',
      title: 'Hajj Comfort 10 Nights • Seamless Support',
      typeLabel: 'Hajj',
      priceFrom: 6490,
      durationDays: 10,
      groupSize: '6–10 Pax',
      hotel: '4★ Hotels • Comfortable Rooms',
      transport: 'Modern coach • Airport transfers',
      highlights: [
        { k: 'Program', v: 'Ritual guidance with structured timings.' },
        { k: 'Transfers', v: 'Arrival + departure assistance.' },
        { k: 'Meals', v: 'Selected meals included in the package.' },
      ],
      features: ['Local guide', 'Counseling sessions', 'Meal schedule'],
      img: 'assets/images/family-trip.jpeg'
    },
    {
      id: 'umrah-luxe-1',
      category: 'umrah',
      title: 'Umrah Luxe 7 Nights • 5★ Experience',
      typeLabel: 'Umrah',
      priceFrom: 3890,
      durationDays: 7,
      groupSize: '4–8 Pax',
      hotel: '5★ Makkah & Madinah • Prime locations',
      transport: 'VIP transfers • Air-conditioned coach',
      highlights: [
        { k: 'Focus', v: 'Umrah rituals with expert coaching.' },
        { k: 'Visits', v: 'Madinah ziyarat plan included.' },
        { k: 'Service', v: 'Personal group coordinator.' },
      ],
      features: ['Zamzam water', 'Prayer schedule', 'Guided sessions'],
      img: 'assets/images/umrah.jpg'
    },
    {
      id: 'umrah-comfort-2',
      category: 'umrah',
      title: 'Umrah Comfort 5 Nights • Great Value',
      typeLabel: 'Umrah',
      priceFrom: 2890,
      durationDays: 5,
      groupSize: '4–10 Pax',
      hotel: '4★ hotels • Comfortable stay',
      transport: 'Transfers • City shuttles',
      highlights: [
        { k: 'Program', v: 'Efficient schedule tailored for families.' },
        { k: 'Support', v: 'Dedicated help desk & reminders.' },
        { k: 'Ziyarah', v: 'Key Madinah moments included.' },
      ],
      features: ['Family-friendly', 'Daily guidance', 'Coordination'],
      img: 'assets/images/kaaba.jpg'
    },
    {
      id: 'tourism-uae-1',
      category: 'tourism',
      title: 'Dubai Luxury City Escape • 5 Days',
      typeLabel: 'Tourism',
      priceFrom: 1490,
      durationDays: 5,
      groupSize: '2–6 Pax',
      hotel: '4★ hotel • Central stay',
      transport: 'Private car • Airport transfers',
      highlights: [
        { k: 'Experience', v: 'Desert safari + city skyline moments.' },
        { k: 'Shopping', v: 'Premium shopping stops included.' },
        { k: 'Dining', v: 'Curated dining recommendations.' },
      ],
      features: ['Premium itinerary', 'Guided tours', 'Comfort planning'],
      img: 'assets/images/dubai.jpeg'
    },
    {
      id: 'tourism-europe-2',
      category: 'tourism',
      title: 'Istanbul Heritage Tour • 7 Days',
      typeLabel: 'Tourism',
      priceFrom: 2190,
      durationDays: 7,
      groupSize: '4–10 Pax',
      hotel: '4★ hotels • Heritage district',
      transport: 'Coach • Transfers',
      highlights: [
        { k: 'Culture', v: 'Historic landmarks and guided storytelling.' },
        { k: 'Experience', v: 'Bosporus cruise & market highlights.' },
        { k: 'Comfort', v: 'Relaxed pacing with expert guides.' },
      ],
      features: ['Heritage guide', 'Cruise included', 'Curated routes'],
      img: 'assets/images/turkey.jpeg'
    },
    {
      id: 'tourism-madagascar-3',
      category: 'tourism',
      title: 'Al Ain & Nature Getaway • 4 Days',
      typeLabel: 'Tourism',
      priceFrom: 990,
      durationDays: 4,
      groupSize: '2–8 Pax',
      hotel: '3–4★ • Scenic stay',
      transport: 'Private transport • Transfers',
      highlights: [
        { k: 'Nature', v: 'Gardens, viewpoints, and day excursions.' },
        { k: 'Relax', v: 'Perfect short break with curated timings.' },
        { k: 'Photos', v: 'Golden hour photography plan.' },
      ],
      features: ['Family-friendly', 'Low hassle planning', 'Comfort travel'],
      img: 'assets/images/malaysia.jpg'
    }
  ];


  function renderPackageCard(p) {
    const price = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(p.priceFrom);
    return `
      <article class="card" role="article" tabindex="0" data-id="${p.id}">
        <div class="media">
          <img src="${p.img}" alt="${escapeHtml(p.title)}">
        </div>
        <div class="body">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="meta">
            <span>⏳ ${p.durationDays} Days</span>
            <span>👥 ${escapeHtml(p.groupSize)}</span>
          </div>
          <div class="price">
            <div>
              <div class="amount">From ${price}</div>
              <div class="tag">Per person</div>
            </div>
            <div class="badge">✨ ${escapeHtml(p.typeLabel)}</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn ghost" type="button" data-open-package="${p.id}">View Details →</button>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  }

  function openPackageModal(p) {
    const existing = $('#packageModal');
    existing?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'packageModal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const html = `
      <div class="modal">
        <div class="modal-header">
          <h3>${escapeHtml(p.title)}</h3>
          <button class="icon-btn" type="button" aria-label="Close" id="modalClose">✕</button>
        </div>
        <div class="modal-content">
          <div class="modal-media">
            <img src="${p.img}" alt="${escapeHtml(p.title)}">
          </div>
          <div class="modal-body">
            <div class="meta" style="margin-bottom:12px; display:flex; gap:10px; flex-wrap:wrap">
              <span>⏳ ${p.durationDays} Days</span>
              <span>👥 ${escapeHtml(p.groupSize)}</span>
              <span>💰 From ${new Intl.NumberFormat(undefined).format(p.priceFrom)}</span>
            </div>

            <p style="color:var(--muted); font-weight:750; margin: 0 0 12px">A premium itinerary designed for comfort, guidance, and spiritual focus.</p>

            <ul class="bullets">
              <li><b>Hotels:</b> ${escapeHtml(p.hotel)}</li>
              <li><b>Transportation:</b> ${escapeHtml(p.transport)}</li>
              ${p.highlights.map(h => `<li><b>${escapeHtml(h.k)}:</b> ${escapeHtml(h.v)}</li>`).join('')}
            </ul>

            <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap">
              <a class="btn primary" href="contact.html">Book This Package →</a>
              <button class="btn" type="button" id="modalCopy">Copy Package Info</button>
            </div>

            <div style="margin-top:10px; color:var(--muted2); font-weight:800; font-size:13px">
              Need help choosing? Contact us and we’ll tailor the best plan.
            </div>
          </div>
        </div>
      </div>
    `;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    $('#modalClose', overlay)?.addEventListener('click', close);

    $('#modalCopy', overlay)?.addEventListener('click', async () => {
      const text = `Package: ${p.title}\nDuration: ${p.durationDays} days\nHotels: ${p.hotel}\nTransport: ${p.transport}\nPrice from: ${p.priceFrom}`;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Package info copied.');
      } catch (e) {
        showToast('Copy not supported in this browser.');
      }
    });

    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      $('#modalClose', overlay)?.focus();
    }, 0);

    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
        close();
      }
    };
    document.addEventListener('keydown', onKey);
  }

  function initPackagesPage() {
    const page = document.body.dataset.page;
    if (!['hajj', 'umrah', 'tourism'].includes(page)) return;

    const mount = $('#packagesMount');
    if (!mount) return;

    const search = $('#packageSearch');
    const dur = $('#durationFilter');
    const hotel = $('#hotelFilter');
    const transport = $('#transportFilter');
    const price = $('#priceFilter');

    const state = {
      q: '',
      duration: dur?.value || 'all',
      hotel: hotel?.value || 'all',
      transport: transport?.value || 'all',
      price: price?.value || 'all'
    };

    const apply = () => {
      state.q = (search?.value || '').trim().toLowerCase();

      let list = PACKAGE_DATA.filter(p => p.category === page);

      if (state.q) {
        list = list.filter(p => (
          p.title.toLowerCase().includes(state.q) ||
          p.hotel.toLowerCase().includes(state.q) ||
          p.transport.toLowerCase().includes(state.q)
        ));
      }

      if (state.duration !== 'all') {
        const [min, max] = state.duration.split('-').map(Number);
        list = list.filter(p => p.durationDays >= min && p.durationDays <= max);
      }

      if (state.hotel !== 'all') {
        if (state.hotel === '5star') list = list.filter(p => p.hotel.includes('5★'));
        if (state.hotel === '4star') list = list.filter(p => p.hotel.includes('4★'));
      }

      if (state.transport !== 'all') {
        if (state.transport === 'vip') list = list.filter(p => p.transport.toLowerCase().includes('vip'));
        if (state.transport === 'coach') list = list.filter(p => p.transport.toLowerCase().includes('coach'));
      }

      if (state.price !== 'all') {
        const [min, max] = state.price.split('-').map(Number);
        list = list.filter(p => p.priceFrom >= min && p.priceFrom <= max);
      }

      if (!list.length) {
        mount.innerHTML = `<div style="padding:18px; color:var(--muted); font-weight:900;">No packages match your filters. Try adjusting your search.</div>`;
        return;
      }

      mount.innerHTML = list.map(renderPackageCard).join('');

      // wire modals
      $$('[data-open-package]', mount).forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-open-package');
          const p = PACKAGE_DATA.find(x => x.id === id);
          if (p) openPackageModal(p);
        });
      });
    };

    [search, dur, hotel, transport, price].forEach(el => {
      el?.addEventListener('input', apply);
      el?.addEventListener('change', apply);
    });

    apply();

    // Also bind from whole card click
    mount.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-package]');
      if (!btn) return;
      const id = btn.getAttribute('data-open-package');
      const p = PACKAGE_DATA.find(x => x.id === id);
      if (p) openPackageModal(p);
    });
  }

  // ---------- Home featured packages ----------
  function initHomeFeatured() {
    const mount = $('#featuredPackages');
    if (!mount) return;

    const list = PACKAGE_DATA.filter(p => p.category !== 'tourism').slice(0, 3)
      .concat(PACKAGE_DATA.filter(p => p.category === 'tourism').slice(0, 1))
      .slice(0, 4);

    mount.innerHTML = list.map(renderPackageCard).join('');

    mount.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-package]');
      if (!btn) return;
      const id = btn.getAttribute('data-open-package');
      const p = PACKAGE_DATA.find(x => x.id === id);
      if (p) openPackageModal(p);
    });
  }

  // ---------- Lightbox gallery ----------
  function initLightbox() {
    const grid = $('#galleryGrid');
    if (!grid) return;

    const imgs = $$('.gitem', grid);
    if (!imgs.length) return;

    let idx = 0;

    const open = (i) => {
      idx = i;
      const item = imgs[idx];
      const src = item.dataset.full || item.src;
      const title = item.dataset.title || item.alt || '';

      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <div class="lb-card" role="dialog" aria-modal="true">
          <div class="lb-media">
            <img src="${src}" alt="${escapeHtml(title)}">
          </div>
          <div class="lb-nav">
            <button class="btn" type="button" data-lb="prev">← Prev</button>
            <div class="lb-title">${escapeHtml(title)}</div>
            <button class="btn" type="button" data-lb="next">Next →</button>
          </div>
        </div>
      `;

      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';

      const close = () => {
        lb.remove();
        document.body.style.overflow = '';
      };

      lb.addEventListener('click', (e) => {
        if (e.target === lb) close();
      });

      lb.addEventListener('keydown', () => {});

      const prevBtn = $('[data-lb="prev"]', lb);
      const nextBtn = $('[data-lb="next"]', lb);
      prevBtn?.addEventListener('click', () => open(idx - 1));
      nextBtn?.addEventListener('click', () => open(idx + 1));

      document.addEventListener('keydown', function onKey(ev){
        if (ev.key === 'Escape') {
          document.removeEventListener('keydown', onKey);
          close();
        }
        if (ev.key === 'ArrowLeft') { document.removeEventListener('keydown', onKey); open(idx - 1); }
        if (ev.key === 'ArrowRight') { document.removeEventListener('keydown', onKey); open(idx + 1); }
      });
    };

    imgs.forEach((img, i) => {
      img.addEventListener('click', () => open(i));
    });
  }

  // ---------- Videos page modal play ----------
  function initVideos() {
    const mount = $('#videoMount');
    if (!mount) return;

    // Render if needed
    // Not strictly required; HTML may already include iframes.
  }

  // ---------- Blog modal ----------
  function initBlog() {
    const mount = $('#blogMount');
    if (!mount) return;

    const btns = $$('[data-read-more]', mount);
    btns.forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-read-more');
        const post = BLOG_POSTS.find(p => p.id === id);
        if (!post) return;
        showBlogModal(post);
      });
    });
  }

  const BLOG_POSTS = [
    {
      id: 'guide-umrah',
      title: 'A Complete Guide to Umrah: What to Expect',
      date: '2026-01-18',
      img: 'assets/images/umrah.jpg',
      excerpt: 'From Ihram to Tawaf—learn the steps, timing, and spiritual etiquette.',
      content: 'Umrah is a journey of devotion. In our arrangements, you receive step-by-step guidance from qualified instructors. We help you understand timing for Tawaf and Sa’i, provide prayer reminders, and coordinate transport between Makkah and Madinah. Your comfort matters—so we offer structured schedules, hotel support, and 24/7 assistance throughout your stay.'
    },
    {
      id: 'hajj-checklist',
      title: 'Hajj Packing Checklist for a Smooth Journey',
      date: '2026-02-02',
      img: 'assets/images/hajj.jpg',
      excerpt: 'Prepare smart: essential documents, comfort items, and travel essentials.',
      content: 'A successful Hajj experience begins with preparation. We recommend keeping your documents organized, bringing comfortable footwear, and preparing for warm weather with breathable clothing. Our team supports you with reminders and practical guidance from arrival to departure, so you can focus on worship with peace of mind.'
    },
    {
      id: 'family-travel',
      title: 'Family Travel Tips for Luxury Tourism Plans',
      date: '2026-03-10',
      img: 'assets/images/family-trip.jpeg',
      excerpt: 'How to plan a premium holiday with comfort, timing, and thoughtful choices.',
      content: 'Travel should feel effortless—especially for families. Our luxury tourism itineraries include comfortable pacing, verified accommodations, and guided recommendations. We plan transportation to minimize waiting time and help you enjoy every moment—from scenic viewpoints to curated dining.'
    }
  ];


  function showBlogModal(post) {
    const existing = $('#blogModal');
    existing?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'blogModal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${escapeHtml(post.title)}</h3>
          <button class="icon-btn" type="button" aria-label="Close" id="blogModalClose">✕</button>
        </div>
        <div class="modal-content">
          <div class="modal-media"><img src="${post.img}" alt="${escapeHtml(post.title)}"></div>
          <div class="modal-body">
            <div style="color:var(--muted); font-weight:900; margin-bottom:10px">🗓 ${escapeHtml(post.date)}</div>
            <p style="color:var(--muted); font-weight:760; margin-top:0">${escapeHtml(post.content)}</p>
            <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap">
              <a class="btn primary" href="contact.html">Ask About This Plan →</a>
              <button class="btn" type="button" id="blogModalCopy">Copy Excerpt</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.remove();
      document.body.style.overflow = '';
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    $('#blogModalClose', overlay)?.addEventListener('click', close);

    $('#blogModalCopy', overlay)?.addEventListener('click', async () => {
      const txt = `${post.title}\n${post.excerpt}`;
      try {
        await navigator.clipboard.writeText(txt);
        showToast('Excerpt copied.');
      } catch (e) {
        showToast('Copy not supported in this browser.');
      }
    });

    document.addEventListener('keydown', function onKey(ev){
      if (ev.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        close();
      }
    });
  }

  function initBlogMount() {
    const mount = $('#blogMount');
    if (!mount) return;

    mount.innerHTML = BLOG_POSTS.map(p => `
      <article class="bcard">
        <div class="media"><img src="${p.img}" alt="${escapeHtml(p.title)}"></div>
        <div class="body">
          <div style="color:var(--muted); font-weight:900; font-size:13px">🗓 ${escapeHtml(p.date)}</div>
          <h3 style="margin:10px 0 8px">${escapeHtml(p.title)}</h3>
          <div style="color:var(--muted); font-weight:750">${escapeHtml(p.excerpt)}</div>
          <div style="margin-top:14px">
            <button class="btn" type="button" data-read-more="${p.id}">Read more →</button>
          </div>
        </div>
      </article>
    `).join('');

    initBlog();
  }

  // ---------- Contact form validation ----------
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const status = $('#contactStatus');

    const setErr = (input, msg) => {
      const wrap = input.closest('.fieldWrap') || input.parentElement;
      wrap?.classList.add('form-error');
      let err = $('.error', wrap);
      if (!err) {
        err = document.createElement('div');
        err.className = 'error';
        err.textContent = msg;
        wrap.appendChild(err);
      } else err.textContent = msg;
      err.style.display = 'block';
    };

    const clearErr = (input) => {
      const wrap = input.closest('.fieldWrap') || input.parentElement;
      wrap?.classList.remove('form-error');
      const err = $('.error', wrap);
      if (err) err.style.display = 'none';
    };

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

    const rules = {
      name: (v) => v.trim().length >= 2,
      email: (v) => isEmail(v),
      phone: (v) => v.replace(/\D/g,'').length >= 8,
      message: (v) => v.trim().length >= 10,
    };

    const inputs = {
      name: $('#contactName'),
      email: $('#contactEmail'),
      phone: $('#contactPhone'),
      message: $('#contactMessage')
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let ok = true;
      Object.entries(inputs).forEach(([k, el]) => {
        const v = el.value;
        clearErr(el);
        if (!rules[k](v)) {
          ok = false;
          const msg = k === 'name' ? 'Please enter your full name.'
            : k === 'email' ? 'Please enter a valid email.'
            : k === 'phone' ? 'Please enter a valid phone number.'
            : 'Message must be at least 10 characters.';
          setErr(el, msg);
        }
      });

      if (!ok) {
        showToast('Please fix the form errors and try again.');
        status.textContent = '';
        return;
      }

      // Simulate success (no backend)
      const name = inputs.name.value.trim().split(' ')[0] || 'there';
      status.textContent = `Thank you, ${name}! Your message has been prepared. Our team will contact you shortly.`;
      showToast('Message sent successfully.');
      form.reset();
      $$('.form-error', form).forEach(w => w.classList.remove('form-error'));
    });
  }

  // ---------- WhatsApp button (no JS needed) ----------

  // ---------- Mobile typing (already) ----------

  // ---------- Entry point ----------
  function init() {
    initLoading();
    initThemeToggle();
    initMobileMenu();
    initActiveNav();
    initReveal();
    initToTop();
    initTyping();
    initCounters();
    initHomeFeatured();
    initTestimonials();
    initAccordion();
    initPackagesPage();
    initLightbox();
    initVideos();
    initBlogMount();
    initContactForm();
  }

  // Events
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
  });

  window.addEventListener('DOMContentLoaded', init);
})();

