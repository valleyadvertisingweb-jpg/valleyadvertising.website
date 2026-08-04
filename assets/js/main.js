/* ===================================
   VALLEY ADVERTISING - Main JS
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile menu ---
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navMobile.classList.remove('open'));
    });
  }

  // --- Active nav link ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // --- Animated counters ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    const suffix = el.getAttribute('data-suffix') || '';
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // --- Product / Gallery filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('[data-category]');

  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        filterItems.forEach(item => {
          const show = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = show ? '' : 'none';
          if (show) {
            item.style.animation = 'fadeUp 0.4s ease forwards';
          }
        });
      });
    });
  }

  // --- Gallery lightbox ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (galleryItems.length && lightbox) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    };
    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // --- Contact form ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message Sent!';
        btn.style.background = '#22c55e';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1200);
    });
  }

  // --- Auto Sliders (gallery + projects) ---
  document.querySelectorAll('.aslider-wrap').forEach(wrap => {
    const track   = wrap.querySelector('.aslider-track');
    const items   = [...wrap.querySelectorAll('.aslider-item')];
    const dotsEl  = wrap.querySelector('.aslider-dots');
    if (!items.length || !track) return;

    const GAP      = 16;
    const INTERVAL = parseInt(wrap.dataset.interval) || 3000;
    let current    = 0;
    let timer      = null;

    function getVisible() {
      const w = window.innerWidth;
      if (w <= 600)  return parseInt(wrap.dataset.mobVisible  || '1');
      if (w <= 900)  return parseInt(wrap.dataset.tabVisible  || '2');
      return parseInt(wrap.dataset.visible || '3');
    }

    function setWidths() {
      const vis = getVisible();
      const w   = (wrap.offsetWidth - GAP * (vis - 1)) / vis;
      items.forEach(item => {
        item.style.width      = w + 'px';
        item.style.flexShrink = '0';
      });
    }

    function totalPages() {
      return Math.ceil(items.length / getVisible());
    }

    function renderDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      for (let i = 0; i < totalPages(); i++) {
        const d = document.createElement('button');
        d.className = 'aslider-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.addEventListener('click', () => { goTo(i); resetTimer(); });
        dotsEl.appendChild(d);
      }
    }

    function updateDots() {
      if (!dotsEl) return;
      dotsEl.querySelectorAll('.aslider-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
    }

    function goTo(page) {
      const pages = totalPages();
      current = ((page % pages) + pages) % pages;
      const vis    = getVisible();
      const itemW  = items[0].offsetWidth;
      const maxOff = Math.max(0, (items.length - vis)) * (itemW + GAP);
      const offset = Math.min(current * vis * (itemW + GAP), maxOff);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    // Init
    setWidths();
    renderDots();
    resetTimer();

    // Pause on hover
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', resetTimer);

    // Touch swipe
    let tx = 0;
    wrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); resetTimer(); }
    }, { passive: true });

    // Responsive resize
    window.addEventListener('resize', () => {
      setWidths(); current = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      renderDots();
      requestAnimationFrame(() => { track.style.transition = ''; });
    });
  });

  // --- Hero Slider (removed — static banner now used) ---
  const heroSlider = document.getElementById('heroSlider');
  if (heroSlider) {
    const slides   = heroSlider.querySelectorAll('.hslide');
    const tags     = heroSlider.querySelectorAll('.slide-tag');
    const dots     = heroSlider.querySelectorAll('.hslider-dot');
    const prevBtn  = document.getElementById('sliderPrev');
    const nextBtn  = document.getElementById('sliderNext');
    const curEl    = heroSlider.querySelector('.hslider-counter .cur');
    const progFill = document.getElementById('sliderProgress');

    const TOTAL    = slides.length;
    const INTERVAL = 5000;
    let current    = 0;
    let timer      = null;
    let paused     = false;

    function goTo(idx) {
      const prev = current;
      current = ((idx % TOTAL) + TOTAL) % TOTAL;

      slides[prev].classList.remove('active');
      if (tags[prev])  tags[prev].classList.remove('active');
      if (dots[prev])  { dots[prev].classList.remove('active'); dots[prev].setAttribute('aria-selected','false'); }

      slides[current].classList.add('active');
      if (tags[current])  tags[current].classList.add('active');
      if (dots[current])  { dots[current].classList.add('active'); dots[current].setAttribute('aria-selected','true'); }

      if (curEl) curEl.textContent = String(current + 1).padStart(2, '0');

      // Reset and run progress bar
      if (progFill) {
        progFill.style.transition = 'none';
        progFill.style.width = '0%';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          progFill.style.transition = `width ${INTERVAL}ms linear`;
          progFill.style.width = '100%';
        }));
      }
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => { if (!paused) goTo(current + 1); }, INTERVAL);
    }

    // Init
    goTo(0);
    startTimer();

    // Pause on hover
    heroSlider.addEventListener('mouseenter', () => {
      paused = true;
      if (progFill) {
        const pct = (progFill.getBoundingClientRect().width / heroSlider.getBoundingClientRect().width) * 100;
        progFill.style.transition = 'none';
        progFill.style.width = pct + '%';
      }
    });
    heroSlider.addEventListener('mouseleave', () => {
      paused = false;
      if (progFill) {
        const pct = parseFloat(progFill.style.width) || 0;
        const remaining = INTERVAL * (1 - pct / 100);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          progFill.style.transition = `width ${remaining}ms linear`;
          progFill.style.width = '100%';
        }));
      }
    });

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

    // Dot clicks
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startTimer(); }));

    // Keyboard navigation
    heroSlider.setAttribute('tabindex', '0');
    heroSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); startTimer(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); startTimer(); }
    });

    // Touch swipe support
    let touchStartX = 0;
    heroSlider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroSlider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); startTimer(); }
    }, { passive: true });
  }

});
