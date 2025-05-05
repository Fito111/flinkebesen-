// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// FAQ Akkordeon
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', !isOpen);
  });
});

// Scroll-Animationen mit Delay
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      entry.target.style.animationDelay = `${delay}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '50px' });
document.querySelectorAll('.animate').forEach(el => observer.observe(el));

// Tastaturnavigation für Formular
document.querySelectorAll('form input, form textarea, form button').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' && el.tagName !== 'BUTTON') {
      e.preventDefault();
      const form = el.form;
      const inputs = Array.from(form.querySelectorAll('input, textarea, button'));
      const next = inputs[inputs.indexOf(el) + 1];
      if (next) next.focus();
    }
  });
});

// Formular mit Edge Function
document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    service: formData.get('service'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    street: formData.get('street') || null,
    zip: formData.get('zip') || null,
    city: formData.get('city') || null,
    date: formData.get('date') || null,
    time: formData.get('time') || null,
    message: formData.get('message') || null,
    photo_url: null // Foto-Upload entfernt
  };

  // Validierung der E-Mail und Telefonnummer
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!emailRegex.test(data.email)) {
    alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    return;
  }
  if (!phoneRegex.test(data.phone)) {
    alert('Bitte geben Sie eine gültige Telefonnummer ein (z. B. +49123456789).');
    return;
  }

  const response = await fetch('https://wvtqoffvvxegwjhwelfz.supabase.co/functions/v1/submit-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (response.ok) {
    alert('Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns bald.');
    e.target.reset();
  } else {
    alert(`Fehler: ${result.error}`);
    console.error(result.error);
  }
});

// Cookie Banner
const cookieBanner = document.getElementById('cookie-banner');
const acceptCookies = document.getElementById('accept-cookies');
const declineCookies = document.getElementById('decline-cookies');

if (cookieBanner) {
  if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.style.display = 'flex';
  }
  acceptCookies.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    cookieBanner.style.display = 'none';
  });
  declineCookies.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    cookieBanner.style.display = 'none';
  });
}

// Slideshow
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// Automatischer Wechsel alle 6 Sekunden
setInterval(nextSlide, 6000);

// Touch-Swipe für Mobilgeräte
let touchStartX = 0;
let touchEndX = 0;
document.querySelector('.slideshow-container').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});
document.querySelector('.slideshow-container').addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  if (touchStartX - touchEndX > 50) {
    nextSlide();
  } else if (touchEndX - touchStartX > 50) {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }
});

// Initialer Slide
showSlide(currentSlide);
