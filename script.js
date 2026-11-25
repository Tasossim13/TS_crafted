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

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
const siteHeader = document.querySelector('.site-header');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('mobile-open', !isOpen);
  if (!isOpen) {
    siteHeader.classList.remove('header-hidden');
  }
});

let previousScrollY = window.scrollY;
let previousScrollDirection = 0;
let accumulatedScroll = 0;
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - previousScrollY;
  previousScrollY = currentScrollY;

  if (currentScrollY <= 24) {
    siteHeader.classList.remove('header-hidden');
    previousScrollDirection = 0;
    accumulatedScroll = 0;
    return;
  }

  const scrollDirection = Math.sign(scrollDelta);
  if (scrollDirection === 0) {
    return;
  }
  if (scrollDirection !== previousScrollDirection) {
    previousScrollDirection = scrollDirection;
    accumulatedScroll = 0;
  }
  accumulatedScroll += Math.abs(scrollDelta);

  if (accumulatedScroll < 8) {
    return;
  }

  if (scrollDirection < 0 || menuToggle.getAttribute('aria-expanded') === 'true') {
    siteHeader.classList.remove('header-hidden');
  } else {
    siteHeader.classList.add('header-hidden');
  }
  accumulatedScroll = 0;
}, { passive: true });


// Language Switcher (EN / EL)
const langBtns = document.querySelectorAll('.lang-btn');
function clearFormStatus(form) {
  const status = form.querySelector('.form-status');
  if (status) {
    status.hidden = true;
    status.textContent = '';
    status.classList.remove('is-error');
  }
}

function setLanguage(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-lang', lang);
  langBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('.contact-form').forEach((form) => clearFormStatus(form));
  try {
    localStorage.setItem('site_lang', lang);
  } catch (e) {}
}
langBtns.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});
const initialLang = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('site_lang') || 'en';
setLanguage(initialLang);

document.querySelectorAll('.contact-form').forEach((form) => {
  form.addEventListener('input', () => clearFormStatus(form));
  form.addEventListener('change', () => clearFormStatus(form));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!(status instanceof HTMLElement) || !(submitButton instanceof HTMLButtonElement)) {
      console.error('Contact form is missing its status message or submit button.');
      return;
    }

    clearFormStatus(form);
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json();
      const succeeded = result.ok === true || result.success === true || result.success === 'true';

      if (!response.ok || !succeeded) {
        const errorMessage = result.error && result.error.message ? result.error.message : result.message;
        throw new Error(errorMessage || `FormSubmit returned HTTP ${response.status}.`);
      }

      form.reset();
      status.textContent = document.body.dataset.lang === 'el'
        ? 'Το μήνυμά σας στάλθηκε με επιτυχία. Θα επικοινωνήσουμε σύντομα.'
        : "Thanks! Your message has been sent. We'll be in touch soon.";
    } catch (error) {
      console.error('Contact form submission failed:', error);
      status.classList.add('is-error');
      const errorDetail = error instanceof Error ? error.message : '';
      const message = document.body.dataset.lang === 'el'
        ? 'Η αποστολή απέτυχε. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας μέσω email.'
        : 'Your message could not be sent. Please try again or email us directly.';
      status.textContent = errorDetail ? `${message} (${errorDetail})` : message;
    } finally {
      status.hidden = false;
      submitButton.disabled = false;
    }
  });
});