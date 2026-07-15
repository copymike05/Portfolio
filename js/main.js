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

// Contact form (demo — no backend wired up)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = 'Message sent — I’ll be in touch';
    btn.disabled = true;
    setTimeout(() => {
      contactForm.reset();
      btn.textContent = original;
      btn.disabled = false;
    }, 2400);
  });
}
