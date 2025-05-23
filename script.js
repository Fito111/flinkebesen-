// Supabase Configuration
const SUPABASE_URL = 'https://wvtqoffvvxegwjhwelfz.supabase.co';
const SUPABASE_API_KEY = 'YOUR_SUPABASE_API_KEY'; // Ersetze mit deinem API-Schlüssel

// Error Logging Function
function logError(message, error) {
  console.error(`[FlinkeBesen] ${message}`, error);
  // Optional: Sende an Monitoring-Dienst (z. B. Sentry)
}

// Prevent Horizontal Scrolling
let touchStartX, touchStartY;
document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', e => {
  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  const deltaX = Math.abs(touchX - touchStartX);
  const deltaY = Math.abs(touchY - touchStartY);

  // Block horizontal scrolling if swipe is more horizontal than vertical
  if (deltaX > deltaY && deltaX > 10) {
    e.preventDefault();
  }
}, { passive: false });

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
      // Close mobile menu after clicking a link
      const menuToggle = document.getElementById('menu-toggle');
      if (menuToggle.checked) {
        menuToggle.checked = false;
      }
    } else {
      console.warn(`[FlinkeBesen] Anchor target not found: ${anchor.getAttribute('href')}`);
    }
  });
});

// Dropdown Menu
document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const dropdown = btn.parentElement;
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});

// Close Dropdown on Outside Click
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  }
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
let debounceTimeout;
const observer = new IntersectionObserver((entries, observer) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.animationDelay = `${delay}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, 50);
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
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(contactForm);

    // Name Validation
    const name = formData.get('name');
    if (!name.trim()) {
      const statusMessage = document.createElement('div');
      statusMessage.setAttribute('aria-live', 'polite');
      statusMessage.classList.add('status-message', 'error');
      statusMessage.textContent = 'Bitte geben Sie Ihren Namen ein.';
      contactForm.appendChild(statusMessage);
      setTimeout(() => statusMessage.remove(), 5000);
      return;
    }

    const data = {
      name: name,
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message') || null
    };

    // Validate Email and Phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const statusMessage = document.createElement('div');
    statusMessage.setAttribute('aria-live', 'polite');
    statusMessage.classList.add('status-message');
    contactForm.appendChild(statusMessage);

    if (!emailRegex.test(data.email)) {
      statusMessage.classList.add('error');
      statusMessage.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      setTimeout(() => statusMessage.remove(), 5000);
      return;
    }
    if (!phoneRegex.test(data.phone)) {
      statusMessage.classList.add('error');
      statusMessage.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein (z. B. +49123456789).';
      setTimeout(() => statusMessage.remove(), 5000);
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_API_KEY}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        statusMessage.classList.add('success');
        statusMessage.textContent = 'Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns bald.';
        contactForm.reset();
      } else {
        statusMessage.classList.add('error');
        statusMessage.textContent = `Fehler: ${result.error || 'Unbekannter Fehler'}`;
        logError('Form submission error:', result.error);
      }
    } catch (error) {
      logError('Network error during form submission:', error);
      statusMessage.classList.add('error');
      statusMessage.textContent = 'Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    }

    setTimeout(() => statusMessage.remove(), 5000);
  });
}

// Slideshow
const slideshowContainer = document.querySelector('.slideshow-container');
if (slideshowContainer) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 6000);

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      updateDots();
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    // Slideshow Controls
    const prevButton = document.querySelector('.slideshow-prev');
    const nextButton = document.querySelector('.slideshow-next');
    const dotsContainer = document.querySelector('.slideshow-dots');
    if (prevButton && nextButton && dotsContainer) {
      // Generate Dots
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('slideshow-dot');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => {
          clearInterval(slideInterval);
          currentSlide = i;
          showSlide(currentSlide);
          slideInterval = setInterval(nextSlide, 6000);
        });
        dotsContainer.appendChild(dot);
      });

      // Button Controls
      prevButton.addEventListener('click', () => {
        clearInterval(slideInterval);
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
        slideInterval = setInterval(nextSlide, 6000);
      });
      nextButton.addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        slideInterval = setInterval(nextSlide, 6000);
      });

      // Update Dots
      function updateDots() {
        document.querySelectorAll('.slideshow-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
    }

    // Initial Slide
    showSlide(currentSlide);
  }
}

// Status Message Styles
const style = document.createElement('style');
style.textContent = `
  .status-message {
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-size: 14px;
  }
  .status-message.success {
    background: #d4edda;
    color: #155724;
  }
  .status-message.error {
    background: #f8d7da;
    color: #721c24;
  }
`;
document.head.appendChild(style);
