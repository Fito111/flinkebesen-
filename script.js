// Supabase Configuration
const SUPABASE_URL = 'https://wvtqoffvvxegwjhwelfz.supabase.co';
const SUPABASE_API_KEY = 'YOUR_SUPABASE_API_KEY'; // Ersetze mit deinem API-Schlüssel

// Error Logging Function
function logError(message, error) {
  console.error(`[FlinkeBesen] ${message}`, error);
  // Optional: Sende an Monitoring-Dienst (z. B. Sentry)
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
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
  }, 100);
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

    // Name Validation
    let name;
    if (formData.get('firstName') && formData.get('lastName')) {
      if (!formData.get('firstName').trim() || !formData.get('lastName').trim()) {
        const statusMessage = document.createElement('div');
        statusMessage.setAttribute('aria-live', 'polite');
        statusMessage.style.marginTop = '10px';
        statusMessage.style.color = 'red';
        statusMessage.textContent = 'Bitte geben Sie Vor- und Nachname ein.';
        form.appendChild(statusMessage);
        setTimeout(() => statusMessage.remove(), 5000);
        return;
      }
      name = `${formData.get('firstName')} ${formData.get('lastName')}`;
    } else if (formData.get('name')) {
      if (!formData.get('name').trim()) {
        const statusMessage = document.createElement('div');
        statusMessage.setAttribute('aria-live', 'polite');
        statusMessage.style.marginTop = '10px';
        statusMessage.style.color = 'red';
        statusMessage.textContent = 'Bitte geben Sie Ihren Namen ein.';
        form.appendChild(statusMessage);
        setTimeout(() => statusMessage.remove(), 5000);
        return;
      }
      name = formData.get('name');
    } else {
      const statusMessage = document.createElement('div');
      statusMessage.setAttribute('aria-live', 'polite');
      statusMessage.style.marginTop = '10px';
      statusMessage.style.color = 'red';
      statusMessage.textContent = 'Name ist erforderlich.';
      form.appendChild(statusMessage);
      setTimeout(() => statusMessage.remove(), 5000);
      return;
    }

    // Handle Photo Upload
    let photo_url = null;
    if (formData.get('photos') && formData.get('photos').size > 0) {
      const file = formData.get('photos');
      const fileName = `${Date.now()}_${file.name}`;
      try {
        const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_API_KEY}`
          },
          body: file
        });
        if (uploadResponse.ok) {
          photo_url = `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
        } else {
          logError('Photo upload failed:', uploadResponse.statusText);
        }
      } catch (error) {
        logError('Photo upload error:', error);
      }
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
      photo_url: photo_url
    };

    // Validate Email and Phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const statusMessage = document.createElement('div');
    statusMessage.setAttribute('aria-live', 'polite');
    statusMessage.style.marginTop = '10px';
    form.appendChild(statusMessage);

    if (!emailRegex.test(data.email)) {
      statusMessage.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      statusMessage.style.color = 'red';
      setTimeout(() => statusMessage.remove(), 5000);
      return;
    }
    if (!phoneRegex.test(data.phone)) {
      statusMessage.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein (z. B. +49123456789).';
      statusMessage.style.color = 'red';
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
        statusMessage.textContent = 'Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns bald.';
        statusMessage.style.color = 'green';
        form.reset();
      } else {
        statusMessage.textContent = `Fehler: ${result.error || 'Unbekannter Fehler'}`;
        statusMessage.style.color = 'red';
        logError('Form submission error:', result.error);
      }
    } catch (error) {
      logError('Network error during form submission:', error);
      statusMessage.textContent = 'Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      statusMessage.style.color = 'red';
    }

    // Remove Status Message after 5 seconds
    setTimeout(() => statusMessage.remove(), 5000);
  });
}

// Slideshow
const slideshowContainer = document.querySelector('.slideshow-container');
if (slideshowContainer) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    let isSwiping = false;
    let isDragging = false;
    let slideInterval = setInterval(nextSlide, 6000);

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    // Add ARIA label for accessibility
    slideshowContainer.setAttribute('aria-label', 'Bild-Slideshow');

    // Touch-Swipe for Mobile Devices
    let touchStartX = 0;
    let touchEndX = 0;
    slideshowContainer.addEventListener('touchstart', e => {
      clearInterval(slideInterval);
      touchStartX = e.changedTouches[0].screenX;
    });
    slideshowContainer.addEventListener('touchend', e => {
      if (isSwiping) return;
      isSwiping = true;
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 75) {
        nextSlide();
      } else if (touchEndX - touchStartX > 75) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      }
      slideInterval = setInterval(nextSlide, 6000);
      setTimeout(() => { isSwiping = false; }, 300);
    });

    // Mouse-Drag for Desktop
    let startX = 0;
    slideshowContainer.addEventListener('mousedown', e => {
      clearInterval(slideInterval);
      isDragging = true;
      startX = e.pageX;
    });
    slideshowContainer.addEventListener('mouseup', e => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.pageX;
      if (startX - endX > 75) {
        nextSlide();
      } else if (endX - startX > 75) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      }
      slideInterval = setInterval(nextSlide, 6000);
    });
    slideshowContainer.addEventListener('mouseleave', () => {
      isDragging = false;
      slideInterval = setInterval(nextSlide, 6000);
    });

    // Initial Slide
    showSlide(currentSlide);
  }
}