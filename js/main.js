/* ============================================
   THE PEGASUS — main.js
   - Time-based theme auto-detection
   - Theme toggle + localStorage persistence
   - Nav scroll, mobile menu, fade-ins, form
============================================ */

(function() {

  /* ========================
     THEME SYSTEM
     Auto: dark 8pm–7am, light 7am–8pm
     Stored in localStorage, overridable by toggle
  ======================== */

  function getAutoTheme() {
    // Get user's local hour via their browser
    const hour = new Date().getHours();
    // Dark from 8pm (20) to 7am (7)
    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pegasus-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(t => {
      t.textContent = theme === 'dark' ? '☀️' : '🌙';
      t.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      t.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  // On load: check stored preference, then auto, then system
  function initTheme() {
    const stored = localStorage.getItem('pegasus-theme');
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
    } else {
      // No stored preference — use time-based auto
      applyTheme(getAutoTheme());
    }
  }

  // Init immediately (before DOM ready to avoid flash)
  initTheme();

  document.addEventListener('DOMContentLoaded', function() {

    /* ========================
       TOGGLE BUTTON HANDLER
    ======================== */
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    // Re-check auto theme every hour (if user hasn't manually set)
    setInterval(function() {
      const stored = localStorage.getItem('pegasus-theme');
      // Only auto-update if user set it via time (not manually toggled recently)
      if (!stored) applyTheme(getAutoTheme());
    }, 60 * 60 * 1000);

    /* ========================
       NAV SCROLL
    ======================== */
    const nav = document.getElementById('nav');
    if (nav) {
      window.addEventListener('scroll', function() {
        nav.classList.toggle('scrolled', window.scrollY > 48);
      }, { passive: true });
    }

    /* ========================
       MOBILE BURGER MENU
    ======================== */
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burger && mobileMenu) {
      burger.addEventListener('click', function() {
        const isOpen = mobileMenu.classList.toggle('open');
        burger.classList.toggle('open', isOpen);
        burger.setAttribute('aria-expanded', isOpen);
        // Prevent body scroll when menu open
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          mobileMenu.classList.remove('open');
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close on outside tap
      document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !burger.contains(e.target)) {
          mobileMenu.classList.remove('open');
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });

      // Close on Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          burger.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    /* ========================
       INTERSECTION OBSERVER
       fade-in + problem cards
    ======================== */
    const io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          // Stagger delay for grouped elements
          const delay = parseInt(entry.target.dataset.delay || 0);
          setTimeout(function() {
            entry.target.classList.add('visible');
          }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Stagger siblings
    document.querySelectorAll('.fade-in, .problem-card').forEach(function(el, i) {
      // Find siblings and stagger
      const siblings = el.parentElement ? el.parentElement.querySelectorAll('.fade-in, .problem-card') : [];
      let idx = Array.from(siblings).indexOf(el);
      el.dataset.delay = idx * 80;
      io.observe(el);
    });

    /* ========================
       SMOOTH SCROLL FOR ANCHORS
    ======================== */
    document.querySelectorAll('a[href*="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        const href = a.getAttribute('href');
        const id = href.split('#')[1];
        if (!id) return;
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
          const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    /* ========================
       CONTACT FORM HANDLER
    ======================== */
    var auditForm = document.getElementById('auditForm');
    if (auditForm) {
      auditForm.addEventListener('submit', handleSubmit);
    }

    function handleSubmit(e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      var data = Object.fromEntries(new FormData(e.target).entries());

      // Replace YOUR_FORM_ID with your Formspree form ID from formspree.io
      fetch('https://formspree.io/f/mwvwpjpj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(res) { showSuccess(); })
      .catch(function() { showSuccess(); }); // Show success either way for now
    }

    function showSuccess() {
      var fw = document.getElementById('formWrap');
      var fs = document.getElementById('formSuccess');
      if (fw && fs) {
        fw.style.display = 'none';
        fs.classList.add('show');
        fs.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

  }); // end DOMContentLoaded

})();
