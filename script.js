// Error Logging Function
function logError(message, error) {
  console.error(`[FlinkeBesen] ${message}`, error);
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
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`[FlinkeBesen] Anchor target not found: ${anchor.getAttribute('href')}`);
    }
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

// Netlify Form Submission Handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    // Kein e.preventDefault() – lass Netlify den POST handhaben und redirecten
    const statusMessage = document.createElement('div');
    statusMessage.setAttribute('aria-live', 'polite');
    statusMessage.classList.add('status-message');
    statusMessage.textContent = 'Senden...';
    contactForm.appendChild(statusMessage);

    // Entferne die Message nach kurzer Zeit, falls kein Redirect sofort passiert
    setTimeout(() => statusMessage.remove(), 3000);
  });
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
    background: #e2e3e5;
    color: #41464b;
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