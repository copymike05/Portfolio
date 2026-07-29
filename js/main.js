// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Theme toggle (light/dark)
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'light');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    item.classList.toggle('open'); 
  });
});

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Video lightbox — click a [data-video] thumbnail to play it with sound
const videoLightbox = document.getElementById('videoLightbox');
if (videoLightbox) {
  const player = videoLightbox.querySelector('.video-lightbox-player');
  const closeBtn = videoLightbox.querySelector('.video-lightbox-close');
  let activePreview = null; // the card's looping preview behind the popup

  const openLightbox = (trigger) => {
    // Pause the small looping preview so it isn't running behind the popup
    activePreview = trigger.querySelector('.project-preview');
    if (activePreview) activePreview.pause();

    player.src = trigger.getAttribute('data-video');
    player.currentTime = 0;
    player.muted = false;
    videoLightbox.classList.add('open');
    videoLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const playPromise = player.play();
    if (playPromise) playPromise.catch(() => {});
  };

  const closeLightbox = () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    videoLightbox.classList.remove('open');
    videoLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Stop the card preview and rewind it to the first frame
    if (activePreview) {
      activePreview.pause();
      activePreview.currentTime = 0;
      activePreview = null;
    }
  };

  document.querySelectorAll('[data-video]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(trigger);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  videoLightbox.addEventListener('click', (e) => {
    if (e.target === videoLightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoLightbox.classList.contains('open')) closeLightbox();
  });
}

// Contact form → validates, then submits to Netlify 
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const alertBox = contactForm.querySelector('.form-alert');
  const formLoadedAt = Date.now();

  // Each rule returns an error string, or '' when the value is acceptable
  const rules = {
    name: (v) => {
      if (!v) return 'Please enter your name.';
      if (v.length < 2) return 'Please enter your full name.';
      return '';
    },
    email: (v) => {
      if (!v) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address.';
      return '';
    },
    service: (v) => (v ? '' : 'Please choose a service.'),
    message: (v) => {
      if (!v) return 'Please describe what you need.';
      if (v.length < 15) return 'Please add a little more detail (at least 15 characters).';
      return '';
    }
  };

  const clearFieldError = (field) => {
    const row = field.closest('.form-row');
    if (!row) return;
    row.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    const msg = row.querySelector('.form-error');
    if (msg) msg.remove();
  };

  const showFieldError = (field, message) => {
    const row = field.closest('.form-row');
    if (!row) return;
    clearFieldError(field);
    row.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');
    const msg = document.createElement('span');
    msg.className = 'form-error';
    msg.textContent = message;
    row.appendChild(msg);
  };

  // Validates every field; returns the labels of the ones that failed
  const validate = () => {
    const failed = [];
    Object.keys(rules).forEach((name) => {
      const field = contactForm.elements[name];
      if (!field) return;
      const value = field.value.trim();
      field.value = value; // strip whitespace-only input
      const error = rules[name](value);
      if (error) {
        showFieldError(field, error);
        const label = contactForm.querySelector(`label[for="${field.id}"]`);
        failed.push(label ? label.textContent.trim() : name);
      } else {
        clearFieldError(field);
      }
    });
    return failed;
  };

  const setAlert = (text, isSuccess) => {
    if (!alertBox) return;
    alertBox.textContent = text;
    alertBox.classList.toggle('success', !!isSuccess);
    alertBox.classList.toggle('show', !!text);
  };

  // Clear a field's error as soon as the visitor starts correcting it
  ['input', 'change'].forEach((evt) => {
    contactForm.addEventListener(evt, (e) => {
      if (e.target.name in rules) clearFieldError(e.target);
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    if (!btn) return;

    const failed = validate();
    if (failed.length) {
      setAlert(
        failed.length === 1
          ? `Please complete the ${failed[0]} field before sending.`
          : `Please complete all fields — still needed: ${failed.join(', ')}.`
      );
      const firstBad = contactForm.querySelector('.form-row.invalid input, .form-row.invalid select, .form-row.invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    // No human fills this form out in under three seconds
    if (Date.now() - formLoadedAt < 3000) {
      setAlert('That was a little too quick — please try again.');
      return;
    }

    setAlert('');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(contactForm)).toString()
      });
      if (!res.ok) throw new Error(res.status);
      contactForm.reset();
      setAlert('Thanks — your message is on its way. I’ll reply within 2 business days.', true);
    } catch (err) {
      setAlert('Something went wrong sending that. Please email mike@mike-muller.dev directly.');
    }

    btn.textContent = original;
    btn.disabled = false;
  });
}
