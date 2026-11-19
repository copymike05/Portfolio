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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal. Only elements that start below the fold get hidden
// (.reveal-pending), and they fade in as they scroll into view. Anything
// already on screen, or every element if the observer is unavailable,
// simply stays visible.
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('reveal-pending');
      io.observe(el);
    }
  });
}

// Store recordings marked [data-autoplay] play muted while on screen
// and pause when scrolled away, so only visible videos use bandwidth.
if ('IntersectionObserver' in window && !reduceMotion) {
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.preload = 'auto';
        const p = video.play();
        if (p) p.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('video[data-autoplay]').forEach((v) => videoIO.observe(v));
}

// Project cards with a [data-hover] video play on hover (mouse) or
// when mostly in view (touch screens, which have no hover).
const hoverVideos = document.querySelectorAll('video[data-hover]');
if (hoverVideos.length && !reduceMotion) {
  const isTouch = window.matchMedia('(hover: none)').matches;
  hoverVideos.forEach((video) => {
    const card = video.closest('.work-card') || video.parentElement;
    const hint = card.querySelector('.play-hint');
    const play = () => {
      video.preload = 'auto';
      const p = video.play();
      if (p) p.catch(() => {});
      card.classList.add('is-playing');
    };
    const stop = () => { video.pause(); card.classList.remove('is-playing'); };
    if (isTouch) {
      if (hint) hint.textContent = '▶ Plays in view';
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? play() : stop()));
        }, { threshold: 0.6 }).observe(video);
      }
    } else {
      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', stop);
    }
  });
}

// Lightbox — [data-video] thumbnails play with sound, [data-image] open full size
const videoLightbox = document.getElementById('videoLightbox');
if (videoLightbox) {
  const player = videoLightbox.querySelector('.video-lightbox-player');
  const image = videoLightbox.querySelector('.video-lightbox-image');
  const closeBtn = videoLightbox.querySelector('.video-lightbox-close');
  let activePreview = null; // the card's looping preview behind the popup
  let lastFocused = null;   // so Escape returns the keyboard where it was

  const showLightbox = (trigger) => {
    lastFocused = trigger;
    videoLightbox.classList.add('open');
    videoLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const openLightbox = (trigger) => {
    // Pause the small looping preview so it isn't running behind the popup
    activePreview = trigger.querySelector('.project-preview');
    if (activePreview) activePreview.pause();

    image.hidden = true;
    player.hidden = false;
    player.src = trigger.getAttribute('data-video');
    player.currentTime = 0;
    player.muted = false;
    showLightbox(trigger);
    const playPromise = player.play();
    if (playPromise) playPromise.catch(() => {});
  };

  const openImageLightbox = (trigger) => {
    player.hidden = true;
    image.hidden = false;
    image.src = trigger.getAttribute('data-image');
    image.alt = trigger.getAttribute('data-image-alt') || '';
    showLightbox(trigger);
  };

  const closeLightbox = () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    image.removeAttribute('src');
    videoLightbox.classList.remove('open');
    videoLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Stop the card preview and rewind it to the first frame
    if (activePreview) {
      activePreview.pause();
      activePreview.currentTime = 0;
      activePreview = null;
    }
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  document.querySelectorAll('[data-video]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(trigger);
    });
  });

  document.querySelectorAll('[data-image]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openImageLightbox(trigger);
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

// Testimonials carousel — arrows only, never auto-advances.
// Slides one card per click and stops at both ends. How many cards are
// visible comes from the --per-view CSS variable, so the layout stays in
// charge of that and this just follows along on resize.
const testimonialCarousel = document.querySelector('.testimonial-carousel');
if (testimonialCarousel) {
  const track = testimonialCarousel.querySelector('.testimonial-track');
  const cards = track.querySelectorAll('.testimonial-card');
  const controls = testimonialCarousel.querySelector('.testimonial-controls');
  const prevBtn = testimonialCarousel.querySelector('[data-testimonial-prev]');
  const nextBtn = testimonialCarousel.querySelector('[data-testimonial-next]');
  let index = 0;

  const perView = () => {
    const value = parseInt(getComputedStyle(testimonialCarousel).getPropertyValue('--per-view'), 10);
    return value > 0 ? value : 1;
  };

  // Last position where the track still fills the viewport
  const maxIndex = () => Math.max(0, cards.length - perView());

  const render = () => {
    index = Math.min(index, maxIndex());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = cards.length ? cards[0].getBoundingClientRect().width + gap : 0;
    track.style.transform = `translateX(-${index * step}px)`;

    // With one or two testimonials there is nowhere to go — hide the arrows
    const scrollable = maxIndex() > 0;
    controls.hidden = !scrollable;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();

    cards.forEach((card, i) => {
      const visible = i >= index && i < index + perView();
      card.setAttribute('aria-hidden', visible ? 'false' : 'true');
      // Keep off-screen cards out of the tab order
      card.querySelectorAll('a, button').forEach((el) => {
        if (visible) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
  };

  prevBtn.addEventListener('click', () => {
    if (index > 0) index -= 1;
    render();
  });
  nextBtn.addEventListener('click', () => {
    if (index < maxIndex()) index += 1;
    render();
  });

  // Card widths change with the breakpoint, so recompute the offset
  window.addEventListener('resize', render);
  render();
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

  // A radio group (the service tiles) comes back as a RadioNodeList with no
  // DOM position of its own, so errors are attached to its first radio.
  const fieldEl = (field) => (typeof RadioNodeList !== 'undefined' && field instanceof RadioNodeList) ? field[0] : field;

  const clearFieldError = (field) => {
    field = fieldEl(field);
    const row = field.closest('.form-row');
    if (!row) return;
    row.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    const msg = row.querySelector('.form-error');
    if (msg) msg.remove();
  };

  const showFieldError = (field, message) => {
    field = fieldEl(field);
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
      if (fieldEl(field) === field) field.value = value; // strip whitespace-only input
      const error = rules[name](value);
      if (error) {
        showFieldError(field, error);
        const el = fieldEl(field);
        const label = contactForm.querySelector(`label[for="${el.id}"]`) || el.closest('.form-row').querySelector('legend');
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
      if (e.target.name in rules) clearFieldError(contactForm.elements[e.target.name]);
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
      const firstBad = contactForm.querySelector('.form-row.invalid input:not([type="hidden"]), .form-row.invalid select, .form-row.invalid textarea');
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
      setAlert("Thanks — your message is on its way. I'll reply within 1 business day.", true);
    } catch (err) {
      setAlert('Something went wrong sending that. Please email mike@mike-muller.dev directly.');
    }

    btn.textContent = original;
    btn.disabled = false;
  });
}

// ============================================================
//  2026 redesign interactions
// ============================================================

// Game of WASH project page: working copy of the extra-dice upsell built for that store.
// Demo only; "Add to cart" just shows a message.
const upsellDemo = document.getElementById('upsellDemo');
if (upsellDemo) {
  const BASE = 160;
  const PER_SET = 5;
  const MAX_PER_COLOR = 10;
  // Same colors as the live store
  const colors = [
    ['Red', '#d32f2f'], ['Yellow', '#f2c200'], ['Green', '#2e7d32'], ['Purple', '#7b1fa2'],
    ['Orange', '#ef6c00'], ['Blue', '#1565c0'], ['White', '#ffffff'], ['Black', '#111111']
  ];
  // Like the live store, each color keeps its own count, shown as a badge on the swatch.
  const state = { on: false, color: 'Blue', counts: {} };
  const box = document.getElementById('upsellBox');
  const toggle = document.getElementById('extraDice');
  const swatches = document.getElementById('diceSwatches');
  const colorName = document.getElementById('diceColorName');
  const setsOut = document.getElementById('setsCount');
  const summary = document.getElementById('setsSummary');
  const total = document.getElementById('demoTotal');
  const note = document.getElementById('demoNote');
  const badges = {};

  const countOf = (name) => state.counts[name] || 0;
  const totalSets = () => Object.values(state.counts).reduce((a, n) => a + n, 0);
  const setCount = (name, n) => { state.counts[name] = Math.max(0, Math.min(MAX_PER_COLOR, n)); };

  colors.forEach(([name, hex]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.style.background = hex;
    b.dataset.color = name;
    b.setAttribute('aria-label', name);
    const badge = document.createElement('span');
    badge.className = 'swatch-badge';
    badge.setAttribute('aria-hidden', 'true');
    b.appendChild(badge);
    badges[name] = badge;
    b.addEventListener('click', () => {
      state.color = name; // selecting only; sets are added with the + button
      render();
    });
    swatches.appendChild(b);
  });

  const render = () => {
    box.classList.toggle('is-on', state.on);
    swatches.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-pressed', s.dataset.color === state.color ? 'true' : 'false'));
    colors.forEach(([name]) => {
      const n = countOf(name);
      badges[name].textContent = n;
      badges[name].hidden = n === 0;
    });
    setsOut.textContent = countOf(state.color);
    colorName.textContent = `Color: ${state.color}`;
    const sets = totalSets();
    summary.textContent = sets ? `${sets} set${sets > 1 ? 's' : ''} · $${(sets * PER_SET).toFixed(2)} total` : 'Pick a color, then press + to add sets';
    total.textContent = `$${(BASE + (state.on ? sets * PER_SET : 0)).toFixed(2)}`;
    note.textContent = '';
  };

  toggle.addEventListener('change', () => {
    state.on = toggle.checked;
    render();
  });
  document.getElementById('setsMinus').addEventListener('click', () => { setCount(state.color, countOf(state.color) - 1); render(); });
  document.getElementById('setsPlus').addEventListener('click', () => { setCount(state.color, countOf(state.color) + 1); render(); });
  upsellDemo.addEventListener('submit', (e) => {
    e.preventDefault();
    const picked = colors.filter(([name]) => countOf(name) > 0).map(([name]) => `${countOf(name)} ${name.toLowerCase()}`);
    note.textContent = state.on && picked.length
      ? `Added: board + dice sets (${picked.join(', ')}) (demo)`
      : 'Added: board only (demo). Flip the switch to see the upsell.';
  });

  // Start fresh every time the page is shown. Browsers restore form fields on refresh
  // and keep the whole page in memory on Back/Forward, which would bring old counts back.
  const reset = () => {
    toggle.checked = false;
    state.on = false;
    state.color = 'Blue';
    state.counts = {};
    render();
  };
  window.addEventListener('pageshow', reset);
  document.getElementById('demoReset').addEventListener('click', reset);
  reset();
}

// Projects: category filter buttons
const projFilters = document.querySelectorAll('.proj-filter');
if (projFilters.length) {
  const rows = document.querySelectorAll('.proj-row');
  const empty = document.getElementById('projEmpty');
  projFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      projFilters.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      const want = btn.dataset.filter;
      let shown = 0;
      rows.forEach((row) => {
        const match = want === 'all' || row.dataset.category === want;
        row.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
}

// Contact: copy email address
const copyBtn = document.getElementById('copyEmail');
if (copyBtn) {
  const addr = document.getElementById('emailAddr');
  const selectAddr = () => {
    const range = document.createRange();
    range.selectNodeContents(addr);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    copyBtn.textContent = 'Selected, press Ctrl+C';
  };
  copyBtn.addEventListener('click', () => {
    if (!navigator.clipboard) return selectAddr();
    navigator.clipboard.writeText(addr.textContent.trim()).then(() => {
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
    }, selectAddr);
  });
}

// Contact: "helpful to include" buttons add a starter line to the message
document.querySelectorAll('[data-msg-hint]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const msg = document.getElementById('message');
    if (!msg) return;
    const sep = msg.value && !msg.value.endsWith('\n') ? '\n' : '';
    msg.value = msg.value + sep + btn.dataset.msgHint;
    msg.focus();
    msg.setSelectionRange(msg.value.length, msg.value.length);
  });
});

// Contact: show the actual reply-by day (next business day)
const replyBy = document.getElementById('replyBy');
if (replyBy) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  replyBy.textContent = `You'll hear back by ${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`;
}

// Home: before/after demo of the Coming Soon badge built for Wicking Vicar.
// Demo only; "Notify me" shows a message and sends nothing.
const comingSoonDemo = document.getElementById('comingSoonDemo');
if (comingSoonDemo) {
  const modeBtns = comingSoonDemo.querySelectorAll('[data-cs-mode]');
  const badge = document.getElementById('csBadge');
  const before = document.getElementById('csBefore');
  const after = document.getElementById('csAfter');
  const email = document.getElementById('csEmail');
  const note = document.getElementById('csNote');

  const setMode = (mode) => {
    const isAfter = mode === 'after';
    modeBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.csMode === mode ? 'true' : 'false'));
    badge.textContent = isAfter ? 'Coming soon' : 'Sold out';
    badge.classList.toggle('is-soon', isAfter);
    before.hidden = isAfter;
    after.hidden = !isAfter;
    note.textContent = '';
  };

  modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.csMode)));
  comingSoonDemo.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      note.textContent = 'Enter an email like you@example.com.';
      email.focus();
      return;
    }
    note.textContent = "You're on the list for this play set. (Demo: nothing was sent.)";
    email.value = '';
  });
  setMode('before');
}
