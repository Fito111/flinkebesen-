// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', !isOpen);
  });
});

// Scroll Animations with Delay
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

// Keyboard Navigation for Forms
document.querySelectorAll('form input, form textarea, form select, form button').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' && el.tagName !== 'BUTTON') {
      e.preventDefault();
      const form = el.form;
      const inputs = Array.from(form.querySelectorAll('input, textarea, select, button'));
      const next = inputs[inputs.indexOf(el) + 1];
      if (next) next.focus();
    }
  });
});

// Form Submission with Supabase Edge Function
const contactForm = document.getElementById('contact-form');
const serviceForm = document.getElementById('service-form');
const form = contactForm || serviceForm;
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    let name;
    if (formData.get('firstName') && formData.get('lastName')) {
      name = `${formData.get('firstName')} ${formData.get('lastName')}`;
    } else {
      name = formData.get('name');
    }
    const data = {
      service: formData.get('service'),
      name: name,
      email: formData.get('email'),
      phone: formData.get('phone'),
      street: formData.get('street') || null,
      zip: formData.get('zip') || null,
      city: formData.get('city') || null,
      date: formData.get('date') || null,
      time: formData.get('time') || null,
      message: formData.get('message') || null,
      photo_url: null // Photo upload not implemented
    };

    // Validate email and phone
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

    try {
      const response = await fetch('https://wvtqoffvvxegwjhwelfz.supabase.co/functions/v1/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        alert('Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns bald.');
        form.reset();
      } else {
        alert(`Fehler: ${result.error || 'Unbekannter Fehler'}`);
        console.error('Form submission error:', result.error);
      }
    } catch (error) {
      console.error('Network error during form submission:', error);
      alert('Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  });
}

// Cookie Banner
const cookieBanner = document.getElementById('cookie-banner');
if (cookieBanner) {
  if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.style.display = 'flex';
  }
  const acceptCookies = document.getElementById('accept-cookies');
  const declineCookies = document.getElementById('decline-cookies');
  if (acceptCookies) {
    acceptCookies.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      cookieBanner.style.display = 'none';
    });
  }
  if (declineCookies) {
    declineCookies.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      cookieBanner.style.display = 'none';
    });
  }
}

// Slideshow
const slideshowContainer = document.querySelector('.slideshow-container');
if (slideshowContainer) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    let isSwiping = false;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    // Automatic slide change every 6 seconds
    setInterval(nextSlide, 6000);

    // Touch-Swipe for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    slideshowContainer.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });
    slideshowContainer.addEventListener('touchend', e => {
      if (isSwiping) return;
      isSwiping = true;
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
      } else if (touchEndX - touchStartX > 50) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      }
      setTimeout(() => { isSwiping = false; }, 300);
    });

    // Initial slide
    showSlide(currentSlide);
  }
}