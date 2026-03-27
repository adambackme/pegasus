// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    const open = mobileMenu.classList.contains('open');
    spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity  = open ? '0' : '1';
    spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
  });
}

// Intersection observer — fade-in + problem cards
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .problem-card').forEach(el => io.observe(el));

// Form handler
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(e.target).entries());

  // Replace YOUR_FORM_ID with your Formspree ID from formspree.io
  fetch('https://formspree.io/f/mwvwpjpj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(() => showSuccess())
  .catch(() => showSuccess());
}

function showSuccess() {
  const fw = document.getElementById('formWrap');
  const fs = document.getElementById('formSuccess');
  if (fw && fs) { fw.style.display = 'none'; fs.classList.add('show'); }
}

// Smooth scroll for #anchors
document.querySelectorAll('a[href*="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').split('#')[1];
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 84, behavior: 'smooth' }); }
  });
});
