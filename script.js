const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

document.querySelectorAll('.magnetic').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    const bounds = button.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  button.addEventListener('pointerleave', () => {
    button.style.transform = '';
  });
});

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.textContent = 'Thanks — your inquiry is on its way.';
  form.reset();
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('mobile-open', !isOpen);
});


// Language Switcher (EN / EL)
const langBtns = document.querySelectorAll('.lang-btn');
function setLanguage(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-lang', lang);
  langBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  try {
    localStorage.setItem('site_lang', lang);
  } catch (e) {}
}
langBtns.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});
const initialLang = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('site_lang') || 'en';
setLanguage(initialLang);