// ============================================================
//  Shared header & footer markup
//  EDIT HERE to update the nav or footer across all pages.
//  These strings get injected into <div id="header"></div> and
//  <div id="footer"></div> on every page when this script runs.
//
//  We embed the markup directly (instead of fetching .html files)
//  so VS Code's Live Server cannot inject its hot-reload script
//  into our partials — which was breaking SVG rendering and
//  truncating the footer.
// ============================================================

const HEADER_HTML = `
<header class="nav">
  <div class="nav-inner">
    <a href="index.html" class="logo">
      <svg class="logo-mark" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#0a0a0a"/>
        <path d="M16 46 V19 L32 37 L48 19 V46" fill="none" stroke="#c7ff3a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="logo-text">Mike Muller</span>
    </a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="theme-toggle" aria-label="Toggle light/dark theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
    <a href="contact.html" class="nav-cta">Let's Connect →</a>
    <button class="nav-toggle" aria-label="Toggle navigation"><span></span></button>
  </div>
</header>
`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-col">
        <span class="logo" style="font-size: 2rem; display: inline-block; margin-bottom: 16px;">Follow Me</span>
        <div class="footer-socials" style="margin-top: 0.5px;">
          <a href="https://github.com/copymike05" target="_blank" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5.99.1-.77.42-1.3.76-1.6-2.66-.3-5.46-1.34-5.46-5.94 0-1.32.47-2.39 1.23-3.23-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/mike-muller-992ba511" target="_blank" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM20 19h-3v-5.6c0-1.4-.5-2.3-1.7-2.3a1.85 1.85 0 0 0-1.7 1.2c-.1.2-.1.5-.1.8V19h-3V8h3v1.3A3 3 0 0 1 16 7.8c2 0 4 1.3 4 4.2V19z"/></svg>
          </a>
          <a href="https://www.upwork.com/freelancers/~0171d1ec43dab3a179" target="_blank" aria-label="Upwork">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6c-2.31 0-4.2 1.55-4.96 3.74-1.18-1.84-1.84-3.62-2.3-5.74H7.3v6.5c0 2-1.18 2-1.66 2-.46 0-1.65 0-1.65-2v-6.5H1.4v6.5c0 2.27 1.85 4.13 4.27 4.13 2.4 0 4.24-1.86 4.24-4.13.94 2 2.04 4.14 2.04 4.14L10.6 20H13l1.21-5.55c.94.6 2.02.95 3.18.95 2.55 0 4.62-2.07 4.62-4.62S20.15 6 17.6 6zm0 6.85c-1.24 0-2.24-1-2.24-2.23s1-2.23 2.24-2.23 2.23 1 2.23 2.23-1 2.23-2.23 2.23z"/></svg>
          </a>
          <a href="#" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Pages</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="projects.html">Projects</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Let's Get in Touch</h4>
        <ul>
          <li><a href="mailto:hello@mikemuller.dev">hello@mikemuller.dev</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="year"></span> Muller Web Development, LLC. All rights reserved.</span>
    </div>
  </div>
</footer>
`;

// ============================================================
//  Loader — inserts the markup into the placeholder divs.
//  Don't edit below unless you're changing how injection works.
// ============================================================

function inject(id, html) {
  const placeholder = document.getElementById(id);
  if (!placeholder) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  placeholder.replaceWith(...wrapper.childNodes);
}

inject('header', HEADER_HTML);
inject('footer', FOOTER_HTML);

// Highlight the current page's nav link
const path = location.pathname.split('/').pop() || 'index.html';
const activeLink = document.querySelector(`.nav-links a[href="${path}"]`);
if (activeLink) activeLink.classList.add('active');

// Set the year in the footer copyright line
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Load main.js AFTER includes are in the DOM
const s = document.createElement('script');
s.src = 'js/main.js';
document.body.appendChild(s);
