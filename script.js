/**
 * ============================================================================
 * HARIVANSH DATA SCIENCE PORTFOLIO — CORE CONTROLLER (script.js)
 * ============================================================================
 * Clean, zero-dependency Vanilla JS organized into well-scoped modules:
 *   1. Utilities & Accessibility Helpers
 *   2. Theme Manager (localStorage + OS sync + canvas re-paint hooks)
 *   3. Navigation, Scroll Progress, Active Scroll Spy & Mobile Drawer
 *   4. Hero Neural Canvas, Typewriter Roles, KPI Counters & 3D Card Tilt
 *   5. Interactive Skills Matrix & SVG Competency Radar
 *   6. Experience & Education Timeline
 *   7. Data-Driven Projects Showcase + Mini Card Previews + Case Study Modal
 *   8. Certifications, Contact Form Validation & Resume Preview Modal
 *   9. Command Palette (Ctrl+K / Cmd+K) & Scroll Reveal Observer
 * ============================================================================
 */

(function () {
  'use strict';

  const DATA = window.PORTFOLIO_DATA || {};
  const PROJECTS = Array.isArray(window.PROJECTS_DATA) ? window.PROJECTS_DATA : [];

  // Global state for cross-component coordination
  const state = {
    theme: document.documentElement.getAttribute('data-theme') || 'dark',
    activeSkillTab: (DATA.skills && DATA.skills[0] && DATA.skills[0].id) || 'ml',
    projectTechFilter: '',
    timelineFilter: 'all',
    timelineExpandedAll: false,
    activeModalProjectIndex: 0,
    activeModalTab: 'overview',
    lastFocusedElement: null
  };

  // Callbacks fired when theme changes so Canvas/SVG visuals stay crisp
  const themeListeners = [];

  // -------------------- 1. UTILITIES & HELPERS --------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'success') {
    const container = $('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-type', type);
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="toast-dot" aria-hidden="true"></span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  async function copyText(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || `Copied: ${text}`);
      return true;
    } catch (err) {
      showToast('Copy failed — please copy manually.', 'error');
      return false;
    }
  }

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Standard Normal CDF approximation (Abramowitz & Stegun) for A/B Z-test
  function normalCdf(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  // -------------------- 2. THEME MANAGER --------------------
  function applyTheme(nextTheme, persist = true) {
    state.theme = nextTheme;
    document.documentElement.setAttribute('data-theme', nextTheme);
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', nextTheme === 'dark' ? '#070b14' : '#f8fafc');
    }
    if (persist) {
      try {
        localStorage.setItem('harivansh-theme', nextTheme);
      } catch (e) { /* ignore storage quota issues */ }
    }
    themeListeners.forEach((fn) => fn(nextTheme));
  }

  function initTheme() {
    const toggleBtn = $('#theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
        showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} mode`);
      });
    }

    // Sync with OS preference if user hasn't explicitly chosen one yet
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = (e) => {
        try {
          if (!localStorage.getItem('harivansh-theme')) {
            applyTheme(e.matches ? 'dark' : 'light', false);
          }
        } catch (err) { /* ignore */ }
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
  }

  // -------------------- 3. SCROLL PROGRESS, SPY & MOBILE DRAWER --------------------
  function initNavigation() {
    const progressBar = $('#scroll-progress-bar');
    const backToTopBtn = $('#back-to-top-btn');
    const navLinks = $$('.nav-link');
    const drawerLinks = $$('.drawer-link');
    const sectionIds = ['about', 'skills', 'experience', 'projects', 'certifications', 'contact'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    function updateScrollUI() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      if (progressBar) progressBar.style.width = `${pct.toFixed(1)}%`;

      if (backToTopBtn) {
        backToTopBtn.classList.toggle('visible', scrollTop > 420);
      }

      // Active section scroll spy
      const offset = scrollTop + 140;
      let currentId = 'about';
      for (const sec of sections) {
        if (sec.offsetTop <= offset) {
          currentId = sec.id;
        }
      }
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.dataset.section === currentId);
      });
      drawerLinks.forEach((link) => {
        link.classList.toggle('active', link.dataset.section === currentId);
      });
    }

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }

    // Platform-aware keyboard hint
    const kbdHint = $('#cmd-kbd-hint');
    if (kbdHint && navigator.platform && !/Mac|iPhone|iPad/i.test(navigator.platform)) {
      kbdHint.textContent = 'Ctrl+K';
    }

    // Mobile Drawer Controls
    const menuBtn = $('#mobile-menu-btn');
    const closeBtn = $('#mobile-close-btn');
    const drawer = $('#mobile-drawer');
    const backdrop = $('#drawer-backdrop');

    function setDrawerOpen(open) {
      if (!drawer || !backdrop || !menuBtn) return;
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      backdrop.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        if (closeBtn) closeBtn.focus();
      } else {
        menuBtn.focus();
      }
    }

    if (menuBtn) menuBtn.addEventListener('click', () => setDrawerOpen(true));
    if (closeBtn) closeBtn.addEventListener('click', () => setDrawerOpen(false));
    if (backdrop) backdrop.addEventListener('click', () => setDrawerOpen(false));
    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });

    const drawerCmdBtn = $('#drawer-cmd-btn');
    if (drawerCmdBtn) {
      drawerCmdBtn.addEventListener('click', () => {
        setDrawerOpen(false);
        openCommandPalette();
      });
    }
    const drawerResumeBtn = $('#drawer-resume-btn');
    if (drawerResumeBtn) {
      drawerResumeBtn.addEventListener('click', () => {
        setDrawerOpen(false);
        openResumeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        setDrawerOpen(false);
      }
    });
  }

  // -------------------- 4. HERO SECTION, CANVAS & KPIs --------------------
  function initHero() {
    const profile = DATA.profile || {};
    const availEl = $('#availability-text');
    const bioEl = $('#hero-bio');
    const nameEl = $('#profile-name');
    const locEl = $('#profile-location');
    const stackEl = $('#profile-stack');
    const focusEl = $('#profile-focus');

    if (availEl && profile.availability) availEl.textContent = profile.availability;
    if (bioEl && profile.bio) bioEl.textContent = profile.bio;
    if (nameEl && profile.name) nameEl.textContent = profile.name;
    if (locEl && profile.location) locEl.textContent = profile.location;
    if (stackEl && profile.primaryStack) stackEl.textContent = profile.primaryStack;
    if (focusEl && profile.focusAreas) focusEl.textContent = profile.focusAreas;

    // Optional real headshot override from data.js
    const avatarFrame = $('#profile-avatar-frame');
    if (avatarFrame && profile.avatarUrl) {
      const img = document.createElement('img');
      img.src = profile.avatarUrl;
      img.alt = `${profile.name || 'Harivansh'} profile photo`;
      img.className = 'profile-avatar-img';
      img.addEventListener('load', () => {
        const fallback = avatarFrame.querySelector('.avatar-fallback');
        if (fallback) fallback.replaceWith(img);
      });
    }

    // Profile Socials
    const socialsWrap = $('#profile-socials');
    if (socialsWrap && Array.isArray(DATA.socials)) {
      socialsWrap.innerHTML = DATA.socials.map((s) => `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="social-pill">
          <span>${escapeHtml(s.label)}</span>
          <span aria-hidden="true">↗</span>
        </a>
      `).join('');
    }

    // Copy Email Button
    const copyEmailBtn = $('#hero-copy-email-btn');
    const copyEmailLabel = $('#hero-email-label');
    if (copyEmailBtn && profile.email) {
      copyEmailBtn.addEventListener('click', async () => {
        const ok = await copyText(profile.email, `Copied ${profile.email}`);
        if (ok && copyEmailLabel) {
          copyEmailLabel.textContent = 'Email Copied!';
          setTimeout(() => { copyEmailLabel.textContent = 'Copy Email'; }, 2000);
        }
      });
    }

    // Animated Role Switcher
    const roleTypedEl = $('#role-typed');
    const roles = Array.isArray(profile.roles) && profile.roles.length
      ? profile.roles
      : ['Data Scientist', 'Machine Learning Engineer', 'Analytics Builder'];

    if (roleTypedEl) {
      if (prefersReducedMotion()) {
        roleTypedEl.textContent = roles[0];
      } else {
        let roleIdx = 0;
        let charIdx = roles[0].length;
        let deleting = true;
        const tick = () => {
          const current = roles[roleIdx];
          if (!deleting) {
            charIdx += 1;
            roleTypedEl.textContent = current.slice(0, charIdx);
            if (charIdx === current.length) {
              deleting = true;
              setTimeout(tick, 1800);
              return;
            }
            setTimeout(tick, 62);
          } else {
            charIdx -= 1;
            roleTypedEl.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
              deleting = false;
              roleIdx = (roleIdx + 1) % roles.length;
              setTimeout(tick, 280);
              return;
            }
            setTimeout(tick, 34);
          }
        };
        setTimeout(tick, 1800);
      }
    }

    // Animated KPI Highlight Counters
    const kpiGrid = $('#hero-kpi-grid');
    if (kpiGrid && Array.isArray(DATA.kpis)) {
      kpiGrid.innerHTML = DATA.kpis.map((k) => `
        <div class="kpi-card" title="${escapeHtml(k.placeholderNote || 'Editable in data.js')}">
          <span class="kpi-value" data-target="${Number(k.target)}" data-suffix="${escapeHtml(k.suffix || '')}">0${escapeHtml(k.suffix || '')}</span>
          <span class="kpi-label">${escapeHtml(k.label)}</span>
        </div>
      `).join('');

      const counters = $$('.kpi-value', kpiGrid);
      const animateCounter = (el) => {
        const target = Number(el.dataset.target) || 0;
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion()) {
          el.textContent = `${target}${suffix}`;
          return;
        }
        const duration = 950;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      if ('IntersectionObserver' in window) {
        let ran = false;
        const obs = new IntersectionObserver((entries) => {
          if (!ran && entries.some((e) => e.isIntersecting)) {
            ran = true;
            counters.forEach(animateCounter);
            obs.disconnect();
          }
        }, { threshold: 0.25 });
        obs.observe(kpiGrid);
      } else {
        counters.forEach(animateCounter);
      }
    }

    // 3D Card Tilt (Pointer Devices Only)
    initTiltCards();

    // Interactive Neural-Network Canvas Background
    initHeroCanvas();
  }

  function initTiltCards() {
    if (prefersReducedMotion() || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    const mouse = { x: null, y: null };
    let rafId = null;

    function buildNodes() {
      const count = Math.min(58, Math.max(24, Math.floor((width * height) / 21000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: 1.6 + Math.random() * 2.1
      }));
    }

    function resize() {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : 600;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
      if (prefersReducedMotion()) drawFrame(false);
    }

    function drawFrame(advance = true) {
      ctx.clearRect(0, 0, width, height);
      const nodeColor = getCssVar('--canvas-node') || 'rgba(129, 140, 248, 0.6)';
      const linkColor = getCssVar('--canvas-link') || 'rgba(56, 189, 248, 0.2)';
      const maxDist = 145;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (advance) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          if (mouse.x !== null) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 10 && dist < 170) {
              n.x += dx * 0.004;
              n.y += dy * 0.004;
            }
          }
        }

        // Draw links
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < maxDist) {
            ctx.strokeStyle = linkColor;
            ctx.globalAlpha = (1 - d / maxDist) * 0.9;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.globalAlpha = 1;
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      drawFrame(true);
      rafId = requestAnimationFrame(loop);
    }

    const heroSection = $('#about');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    window.addEventListener('resize', resize);
    themeListeners.push(() => {
      if (prefersReducedMotion()) drawFrame(false);
    });

    resize();
    if (!prefersReducedMotion()) {
      rafId = requestAnimationFrame(loop);
    }

    // Pause animation when tab hidden for battery efficiency
    document.addEventListener('visibilitychange', () => {
      if (prefersReducedMotion()) return;
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    });
  }

  // -------------------- 5. INTERACTIVE SKILLS MATRIX & RADAR --------------------
  function initSkillsMatrix() {
    const categories = Array.isArray(DATA.skills) ? DATA.skills : [];
    if (!categories.length) return;

    const tabsContainer = $('#skills-tabs');
    const gridContainer = $('#skills-grid');
    const radarContainer = $('#radar-chart-container');
    const radarLegend = $('#radar-legend');
    const radarScoreBadge = $('#radar-active-score');
    const inlineClearBtn = $('#clear-skill-filter-inline');

    function renderTabs() {
      if (!tabsContainer) return;
      tabsContainer.innerHTML = categories.map((cat) => `
        <button
          type="button"
          class="skill-tab-btn ${cat.id === state.activeSkillTab ? 'active' : ''}"
          role="tab"
          aria-selected="${cat.id === state.activeSkillTab}"
          data-skill-tab="${escapeHtml(cat.id)}"
        >
          ${escapeHtml(cat.tabLabel)}
        </button>
      `).join('');

      $$('[data-skill-tab]', tabsContainer).forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeSkillTab = btn.dataset.skillTab;
          renderTabs();
          renderSkillsGrid();
          renderRadar();
        });
      });
    }

    function renderSkillsGrid() {
      if (!gridContainer) return;
      const activeCat = categories.find((c) => c.id === state.activeSkillTab) || categories[0];
      if (!activeCat) return;

      gridContainer.innerHTML = activeCat.items.map((skill) => {
        const isActive = state.projectTechFilter.toLowerCase() === skill.filterTag.toLowerCase();
        return `
          <button
            type="button"
            class="skill-item-card ${isActive ? 'is-filtered' : ''}"
            data-filter-skill="${escapeHtml(skill.filterTag)}"
            title="Click to filter projects matching ${escapeHtml(skill.filterTag)}"
          >
            <div class="skill-item-top">
              <span class="skill-name">${escapeHtml(skill.name)}</span>
              <span class="skill-pct mono">${Number(skill.level)}%</span>
            </div>
            <div class="skill-bar-track">
              <div class="skill-bar-fill" style="width: ${Number(skill.level)}%"></div>
            </div>
            <div class="skill-meta">${escapeHtml(skill.context)}</div>
          </button>
        `;
      }).join('');

      if (inlineClearBtn) {
        inlineClearBtn.hidden = !state.projectTechFilter;
      }

      $$('[data-filter-skill]', gridContainer).forEach((card) => {
        card.addEventListener('click', () => {
          const tag = card.dataset.filterSkill;
          const togglingOff = state.projectTechFilter.toLowerCase() === tag.toLowerCase();
          state.projectTechFilter = togglingOff ? '' : tag;
          renderSkillsGrid();
          syncProjectFiltersAndRender();
          if (!togglingOff) {
            showToast(`Highlighted projects using "${tag}"`);
            const projSec = $('#projects');
            if (projSec) {
              projSec.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            }
          } else {
            showToast('Cleared skill highlight');
          }
        });
      });
    }

    if (inlineClearBtn) {
      inlineClearBtn.addEventListener('click', () => {
        state.projectTechFilter = '';
        renderSkillsGrid();
        syncProjectFiltersAndRender();
      });
    }

    function renderRadar() {
      if (!radarContainer) return;
      const size = 280;
      const cx = size / 2;
      const cy = size / 2;
      const maxR = 92;
      const levels = 4;
      const n = categories.length;
      const angleStep = (Math.PI * 2) / n;

      // Concentric rings
      let gridSvg = '';
      for (let l = 1; l <= levels; l++) {
        const r = (maxR * l) / levels;
        const pts = categories.map((_, i) => {
          const a = -Math.PI / 2 + i * angleStep;
          return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
        }).join(' ');
        gridSvg += `<polygon points="${pts}" fill="none" stroke="var(--border-strong)" stroke-width="1" opacity="0.65"/>`;
      }

      // Axis lines + labels
      let axesSvg = '';
      const dataPoints = [];
      categories.forEach((cat, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const xEnd = cx + maxR * Math.cos(a);
        const yEnd = cy + maxR * Math.sin(a);
        axesSvg += `<line x1="${cx}" y1="${cy}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="var(--border-subtle)" stroke-width="1"/>`;

        const score = Number(cat.pillarScore || 85) / 100;
        const px = cx + maxR * score * Math.cos(a);
        const py = cy + maxR * score * Math.sin(a);
        dataPoints.push({ x: px, y: py, cat });

        const lx = cx + (maxR + 24) * Math.cos(a);
        const ly = cy + (maxR + 18) * Math.sin(a);
        const isActive = cat.id === state.activeSkillTab;
        axesSvg += `
          <text
            x="${lx.toFixed(1)}"
            y="${ly.toFixed(1)}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="11"
            font-family="var(--font-mono)"
            font-weight="${isActive ? '700' : '500'}"
            fill="${isActive ? 'var(--accent-cyan-text)' : 'var(--text-secondary)'}"
            style="cursor:pointer"
            data-radar-axis="${escapeHtml(cat.id)}"
          >${escapeHtml(cat.shortLabel)}</text>
        `;
      });

      const polyPts = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const nodesSvg = dataPoints.map((p) => {
        const isActive = p.cat.id === state.activeSkillTab;
        return `
          <circle
            cx="${p.x.toFixed(1)}"
            cy="${p.y.toFixed(1)}"
            r="${isActive ? 6.5 : 4.5}"
            fill="${isActive ? 'var(--accent-cyan)' : 'var(--accent-primary)'}"
            stroke="var(--bg-primary)"
            stroke-width="2"
            style="cursor:pointer"
            data-radar-axis="${escapeHtml(p.cat.id)}"
          >
            <title>${escapeHtml(p.cat.tabLabel)}: ${p.cat.pillarScore}%</title>
          </circle>
        `;
      }).join('');

      radarContainer.innerHTML = `
        <svg class="radar-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Competency radar chart across 4 Data Science pillars">
          ${gridSvg}
          ${axesSvg}
          <polygon points="${polyPts}" fill="var(--accent-primary)" fill-opacity="0.22" stroke="var(--accent-cyan)" stroke-width="2.2"/>
          ${nodesSvg}
        </svg>
      `;

      $$('[data-radar-axis]', radarContainer).forEach((node) => {
        node.addEventListener('click', () => {
          state.activeSkillTab = node.dataset.radarAxis;
          renderTabs();
          renderSkillsGrid();
          renderRadar();
        });
      });

      const activeCat = categories.find((c) => c.id === state.activeSkillTab) || categories[0];
      if (radarScoreBadge && activeCat) {
        radarScoreBadge.textContent = `${activeCat.pillarScore}% Domain Index`;
      }

      if (radarLegend) {
        radarLegend.innerHTML = categories.map((cat) => `
          <button
            type="button"
            class="radar-legend-btn ${cat.id === state.activeSkillTab ? 'active' : ''}"
            data-legend-tab="${escapeHtml(cat.id)}"
          >
            <span>${escapeHtml(cat.shortLabel)}</span>
            <strong class="mono">${cat.pillarScore}%</strong>
          </button>
        `).join('');

        $$('[data-legend-tab]', radarLegend).forEach((btn) => {
          btn.addEventListener('click', () => {
            state.activeSkillTab = btn.dataset.legendTab;
            renderTabs();
            renderSkillsGrid();
            renderRadar();
          });
        });
      }
    }

    renderTabs();
    renderSkillsGrid();
    renderRadar();
  }

  // -------------------- 6. EXPERIENCE & EDUCATION TIMELINE --------------------
  function initTimeline() {
    const entries = Array.isArray(DATA.timeline) ? DATA.timeline : [];
    const listEl = $('#timeline-list');
    const filterBtns = $$('[data-timeline-filter]');
    const toggleAllBtn = $('#toggle-all-timeline-btn');
    if (!listEl) return;

    function render() {
      const filtered = entries.filter((item) =>
        state.timelineFilter === 'all' ? true : item.kind === state.timelineFilter
      );

      listEl.innerHTML = filtered.map((item) => {
        const isOpen = state.timelineExpandedAll || Boolean(item.expandedByDefault);
        const kindLabel = item.kind === 'education' ? 'Education' : 'Experience';
        return `
          <article class="timeline-item" data-kind="${escapeHtml(item.kind)}">
            <span class="timeline-dot" aria-hidden="true"></span>
            <div class="timeline-card">
              <button
                type="button"
                class="timeline-toggle-btn"
                aria-expanded="${isOpen}"
                aria-controls="tl-details-${escapeHtml(item.id)}"
              >
                <div class="timeline-head-main">
                  <div class="timeline-badges">
                    <span class="badge ${item.kind === 'education' ? 'badge-accent' : 'badge-success'} mono">${kindLabel}</span>
                    <span class="mono" style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.period)} · ${escapeHtml(item.location)}</span>
                  </div>
                  <h3 class="timeline-role">${escapeHtml(item.role)}</h3>
                  <p class="timeline-org">${escapeHtml(item.org)}</p>
                </div>
                <svg class="timeline-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <div class="timeline-details" id="tl-details-${escapeHtml(item.id)}" ${isOpen ? '' : 'hidden'}>
                <p class="timeline-summary">${escapeHtml(item.summary)}</p>
                <ul class="timeline-bullets">
                  ${(item.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
                </ul>
                <div class="timeline-tags">
                  ${(item.tags || []).map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      $$('.timeline-toggle-btn', listEl).forEach((btn) => {
        btn.addEventListener('click', () => {
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          const targetId = btn.getAttribute('aria-controls');
          const details = document.getElementById(targetId);
          btn.setAttribute('aria-expanded', String(!expanded));
          if (details) details.hidden = expanded;
        });
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.timelineFilter = btn.dataset.timelineFilter;
        filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
        render();
      });
    });

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        state.timelineExpandedAll = !state.timelineExpandedAll;
        toggleAllBtn.textContent = state.timelineExpandedAll ? 'Collapse All' : 'Expand All';
        render();
      });
    }

    render();
  }

  // -------------------- 7. PROJECTS SHOWCASE, MINI PREVIEWS & CASE MODAL --------------------
  function renderMiniPreviewMarkup(project) {
    const id = escapeHtml(project.id);
    switch (project.miniPreviewType) {
      case 'churn':
        return `
          <div class="mini-preview-box" data-mini-preview="churn" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">Live Churn Risk Scorer</span>
              <span class="mini-preview-result" id="mini-out-${id}">68% · High Risk</span>
            </div>
            <div class="mini-controls-stack">
              <div class="mini-slider-row">
                <label for="mini-churn-usage-${id}">Usage Drop: <strong id="mini-churn-uval-${id}">35%</strong></label>
                <input type="range" id="mini-churn-usage-${id}" min="0" max="80" value="35" data-mini-control />
              </div>
              <div class="mini-slider-row">
                <label for="mini-churn-tix-${id}">Open Tickets: <strong id="mini-churn-tval-${id}">4</strong></label>
                <input type="range" id="mini-churn-tix-${id}" min="0" max="10" value="4" data-mini-control />
              </div>
            </div>
          </div>
        `;

      case 'forecast':
        return `
          <div class="mini-preview-box" data-mini-preview="forecast" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">Interactive Forecast Horizon</span>
              <span class="mini-preview-result" id="mini-out-${id}">30D · 14.2K units</span>
            </div>
            <div class="mini-pill-row" style="margin-bottom:8px;">
              <button type="button" class="mini-pill-btn" data-horizon="7" data-mini-control>7D</button>
              <button type="button" class="mini-pill-btn active" data-horizon="30" data-mini-control>30D</button>
              <button type="button" class="mini-pill-btn" data-horizon="90" data-mini-control>90D</button>
              <button type="button" class="mini-pill-btn active" data-ci-toggle="1" data-mini-control>P10–P90 Band</button>
            </div>
            <svg class="mini-svg-chart" id="mini-svg-${id}" viewBox="0 0 260 68" aria-label="Mini demand forecast chart"></svg>
          </div>
        `;

      case 'sentiment':
        return `
          <div class="mini-preview-box" data-mini-preview="sentiment" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">Live Ticket Sentiment Tester</span>
              <span class="mini-preview-result" id="mini-out-${id}">Escalate · Billing</span>
            </div>
            <div class="mini-controls-stack">
              <input type="text" class="mini-text-input" id="mini-sent-input-${id}" value="Double billing charge on invoice, urgent!" aria-label="Test ticket message" data-mini-control />
              <div class="mini-pill-row">
                <button type="button" class="mini-pill-btn" data-sample="Love how fast the API works now!" data-mini-control>Positive</button>
                <button type="button" class="mini-pill-btn" data-sample="Dashboard CSV export timed out again" data-mini-control>Bug Report</button>
                <button type="button" class="mini-pill-btn" data-sample="Double billing charge on invoice, urgent!" data-mini-control>Urgent Billing</button>
              </div>
            </div>
          </div>
        `;

      case 'threshold':
        return `
          <div class="mini-preview-box" data-mini-preview="threshold" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">Fraud Threshold Simulator</span>
              <span class="mini-preview-result" id="mini-out-${id}">P: 91% · R: 84%</span>
            </div>
            <div class="mini-controls-stack">
              <div class="mini-slider-row">
                <label for="mini-thr-${id}">Cutoff: <strong id="mini-thr-val-${id}">0.70</strong></label>
                <input type="range" id="mini-thr-${id}" min="0.35" max="0.95" step="0.05" value="0.70" data-mini-control />
              </div>
              <div class="mini-meta-line mono" id="mini-thr-alerts-${id}" style="font-size:0.75rem; color:var(--text-muted);">
                Est. Manual Review Queue: 38 txns / day
              </div>
            </div>
          </div>
        `;

      case 'vision':
        return `
          <div class="mini-preview-box" data-mini-preview="vision" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">PCB Optical Inspector</span>
              <span class="mini-preview-result" id="mini-out-${id}">REJECT · 0.92 conf</span>
            </div>
            <div class="mini-pill-row" style="margin-bottom:8px;">
              <button type="button" class="mini-pill-btn active" data-pcb-scene="bridge" data-mini-control>Solder Bridge</button>
              <button type="button" class="mini-pill-btn" data-pcb-scene="pad" data-mini-control>Missing Pad</button>
              <button type="button" class="mini-pill-btn" data-pcb-scene="clean" data-mini-control>Clean Board</button>
            </div>
            <div class="mini-slider-row">
              <label for="mini-vis-conf-${id}">Min Conf: <strong id="mini-vis-cval-${id}">0.65</strong></label>
              <input type="range" id="mini-vis-conf-${id}" min="0.40" max="0.95" step="0.05" value="0.65" data-mini-control />
            </div>
          </div>
        `;

      case 'abtest':
      default:
        return `
          <div class="mini-preview-box" data-mini-preview="abtest" data-proj="${id}">
            <div class="mini-preview-header">
              <span class="mini-preview-title">A/B Significance Check</span>
              <span class="mini-preview-result" id="mini-out-${id}">+14.3% · p=0.012</span>
            </div>
            <div class="mini-controls-stack">
              <div class="mini-slider-row">
                <label for="mini-ab-var-${id}">Variant Conv: <strong id="mini-ab-vval-${id}">4.8%</strong></label>
                <input type="range" id="mini-ab-var-${id}" min="3.8" max="6.2" step="0.1" value="4.8" data-mini-control />
              </div>
              <div class="mini-meta-line mono" id="mini-ab-note-${id}" style="font-size:0.75rem; color:var(--accent-emerald);">
                Baseline: 4.2% (n=12,000/arm) · Ship Variant
              </div>
            </div>
          </div>
        `;
    }
  }

  function wireMiniPreviewEvents(cardEl, project) {
    const id = project.id;
    const box = $(`.mini-preview-box[data-proj="${CSS.escape(id)}"]`, cardEl);
    if (!box) return;

    // Prevent clicks/inputs inside the live mini widget from opening the full Case Study Modal
    box.addEventListener('click', (e) => e.stopPropagation());

    if (project.miniPreviewType === 'churn') {
      const usageSlider = $(`#mini-churn-usage-${CSS.escape(id)}`, box);
      const tixSlider = $(`#mini-churn-tix-${CSS.escape(id)}`, box);
      const uVal = $(`#mini-churn-uval-${CSS.escape(id)}`, box);
      const tVal = $(`#mini-churn-tval-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);

      const update = () => {
        const u = Number(usageSlider.value);
        const t = Number(tixSlider.value);
        uVal.textContent = `${u}%`;
        tVal.textContent = `${t}`;
        const z = -2.1 + u * 0.045 + t * 0.34;
        const prob = Math.round((1 / (1 + Math.exp(-z))) * 100);
        const tier = prob >= 65 ? 'High Risk' : prob >= 35 ? 'Watch' : 'Healthy';
        out.textContent = `${prob}% · ${tier}`;
        out.style.color = prob >= 65 ? 'var(--accent-rose)' : prob >= 35 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
      };
      usageSlider.addEventListener('input', update);
      tixSlider.addEventListener('input', update);
      update();
    } else if (project.miniPreviewType === 'forecast') {
      let horizon = 30;
      let showCi = true;
      const svg = $(`#mini-svg-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);
      const horizonBtns = $$('[data-horizon]', box);
      const ciBtn = $('[data-ci-toggle]', box);

      const draw = () => {
        const pts = horizon === 7 ? 8 : horizon === 30 ? 15 : 22;
        const w = 260;
        const h = 68;
        const values = Array.from({ length: pts }, (_, i) => {
          const wave = Math.sin(i * 0.65) * 11 + i * 1.1;
          return Math.max(12, Math.min(54, 34 + wave));
        });
        const stepX = w / (pts - 1);
        const linePts = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - v).toFixed(1)}`).join(' ');
        const upper = values.map((v, i) => `${(i * stepX).toFixed(1)},${Math.max(4, h - v - 9).toFixed(1)}`);
        const lower = values.map((v, i) => `${(i * stepX).toFixed(1)},${Math.min(h - 4, h - v + 9).toFixed(1)}`).reverse();
        const bandPts = [...upper, ...lower].join(' ');

        svg.innerHTML = `
          ${showCi ? `<polygon points="${bandPts}" fill="var(--accent-cyan)" fill-opacity="0.16" />` : ''}
          <polyline points="${linePts}" fill="none" stroke="var(--accent-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        `;
        const total = horizon === 7 ? '3.4K' : horizon === 30 ? '14.2K' : '44.8K';
        out.textContent = `${horizon}D · ${total} units`;
      };

      horizonBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          horizon = Number(btn.dataset.horizon);
          horizonBtns.forEach((b) => b.classList.toggle('active', b === btn));
          draw();
        });
      });
      if (ciBtn) {
        ciBtn.addEventListener('click', () => {
          showCi = !showCi;
          ciBtn.classList.toggle('active', showCi);
          draw();
        });
      }
      draw();
    } else if (project.miniPreviewType === 'sentiment') {
      const input = $(`#mini-sent-input-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);
      const samples = $$('[data-sample]', box);

      const analyze = (text) => {
        const res = analyzeTicketText(text);
        out.textContent = `${res.urgency} · ${res.intent}`;
        out.style.color = res.urgency === 'Escalate'
          ? 'var(--accent-rose)'
          : res.urgency === 'Positive'
            ? 'var(--accent-emerald)'
            : 'var(--accent-cyan-text)';
      };

      input.addEventListener('input', () => analyze(input.value));
      samples.forEach((btn) => {
        btn.addEventListener('click', () => {
          input.value = btn.dataset.sample;
          analyze(input.value);
        });
      });
      analyze(input.value);
    } else if (project.miniPreviewType === 'threshold') {
      const slider = $(`#mini-thr-${CSS.escape(id)}`, box);
      const valEl = $(`#mini-thr-val-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);
      const alertsEl = $(`#mini-thr-alerts-${CSS.escape(id)}`, box);

      const update = () => {
        const thr = Number(slider.value);
        valEl.textContent = thr.toFixed(2);
        const precision = Math.min(99, Math.round(62 + thr * 41));
        const recall = Math.max(48, Math.round(106 - thr * 34));
        const queue = Math.max(8, Math.round((1 - thr) * 125));
        out.textContent = `P: ${precision}% · R: ${recall}%`;
        alertsEl.textContent = `Est. Manual Review Queue: ${queue} txns / day`;
      };
      slider.addEventListener('input', update);
      update();
    } else if (project.miniPreviewType === 'vision') {
      let scene = 'bridge';
      const slider = $(`#mini-vis-conf-${CSS.escape(id)}`, box);
      const cVal = $(`#mini-vis-cval-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);
      const sceneBtns = $$('[data-pcb-scene]', box);
      const sceneScores = { bridge: 0.92, pad: 0.78, clean: 0.14 };

      const update = () => {
        const cutoff = Number(slider.value);
        cVal.textContent = cutoff.toFixed(2);
        const score = sceneScores[scene];
        const rejected = score >= cutoff;
        out.textContent = `${rejected ? 'REJECT' : 'PASS'} · ${score.toFixed(2)} conf`;
        out.style.color = rejected ? 'var(--accent-rose)' : 'var(--accent-emerald)';
      };

      sceneBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          scene = btn.dataset.pcbScene;
          sceneBtns.forEach((b) => b.classList.toggle('active', b === btn));
          update();
        });
      });
      slider.addEventListener('input', update);
      update();
    } else if (project.miniPreviewType === 'abtest') {
      const slider = $(`#mini-ab-var-${CSS.escape(id)}`, box);
      const vVal = $(`#mini-ab-vval-${CSS.escape(id)}`, box);
      const out = $(`#mini-out-${CSS.escape(id)}`, box);
      const note = $(`#mini-ab-note-${CSS.escape(id)}`, box);

      const update = () => {
        const p1 = 0.042;
        const p2 = Number(slider.value) / 100;
        const n = 12000;
        vVal.textContent = `${(p2 * 100).toFixed(1)}%`;
        const stats = computeAbStats(n, Math.round(n * p1), n, Math.round(n * p2));
        const sign = stats.relLift >= 0 ? '+' : '';
        out.textContent = `${sign}${stats.relLift.toFixed(1)}% · p=${stats.pVal.toFixed(3)}`;
        const sig = stats.pVal < 0.05 && stats.relLift > 0;
        out.style.color = sig ? 'var(--accent-emerald)' : 'var(--text-secondary)';
        note.textContent = `Baseline: 4.2% (n=12k/arm) · ${sig ? 'Statistically Significant' : 'Keep Collecting'}`;
        note.style.color = sig ? 'var(--accent-emerald)' : 'var(--text-muted)';
      };
      slider.addEventListener('input', update);
      update();
    }
  }

  function analyzeTicketText(text) {
    const t = String(text || '').toLowerCase();
    const urgentWords = ['urgent', 'double', 'charged', 'outage', 'down', 'failed', 'error', 'broken', 'refund', 'blocked', 'timeout', 'timed out'];
    const posWords = ['love', 'great', 'fast', 'awesome', 'thanks', 'helpful', 'smooth', 'amazing'];
    const billingWords = ['billing', 'invoice', 'charge', 'charged', 'refund', 'payment', 'card'];
    const bugWords = ['bug', 'export', 'crash', 'timed out', 'timeout', 'error', '404', '500'];

    const tokens = t.split(/[^a-z0-9]+/).filter(Boolean);
    let score = 0;
    const matched = [];
    tokens.forEach((w) => {
      if (urgentWords.includes(w)) { score -= 1.4; matched.push({ word: w, weight: -1.4 }); }
      if (posWords.includes(w)) { score += 1.3; matched.push({ word: w, weight: +1.3 }); }
    });
    if (t.includes('timed out')) score -= 1.2;

    let intent = 'General Inquiry';
    if (billingWords.some((b) => t.includes(b))) intent = 'Billing';
    else if (bugWords.some((b) => t.includes(b))) intent = 'Tech Support';
    else if (score > 0.5) intent = 'Feedback';

    const urgency = score <= -1.0 ? 'Escalate' : score >= 0.8 ? 'Positive' : 'Standard';
    return { score, urgency, intent, matched };
  }

  function computeAbStats(n1, c1, n2, c2) {
    const p1 = c1 / Math.max(1, n1);
    const p2 = c2 / Math.max(1, n2);
    const pool = (c1 + c2) / Math.max(1, n1 + n2);
    const se = Math.sqrt(Math.max(1e-9, pool * (1 - pool) * (1 / n1 + 1 / n2)));
    const z = (p2 - p1) / se;
    const pVal = 2 * (1 - normalCdf(Math.abs(z)));
    const relLift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;
    return { p1, p2, z, pVal, relLift };
  }

  function projectMatchesSkill(proj, skill) {
    const tech = (skill || '').trim().toLowerCase();
    if (!tech) return false;
    return (proj.tags || []).some((t) => t.toLowerCase() === tech)
      || proj.category.toLowerCase() === tech
      || `${proj.title} ${proj.summary} ${(proj.pipeline || []).map((s) => `${s.title} ${s.detail}`).join(' ')}`.toLowerCase().includes(tech);
  }

  function syncProjectFiltersAndRender() {
    const grid = $('#projects-grid');
    if (!grid) return;

    grid.innerHTML = PROJECTS.map((proj) => {
      const highlighted = projectMatchesSkill(proj, state.projectTechFilter);
      return `
        <article
          class="project-card ${highlighted ? 'skill-highlighted' : ''}"
          tabindex="0"
          role="button"
          aria-label="Open case study for ${escapeHtml(proj.title)}"
          data-open-project="${escapeHtml(proj.id)}"
        >
          <div>
            <div class="project-card-top">
              <span class="badge badge-accent mono">${escapeHtml(proj.category)}</span>
              <span class="badge badge-success mono">${escapeHtml(proj.impactBadge)}</span>
            </div>
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-summary">${escapeHtml(proj.summary)}</p>

            ${renderMiniPreviewMarkup(proj)}
          </div>

          <div>
            <div class="project-tags">
              ${(proj.tags || []).map((tag) => `
                <button
                  type="button"
                  class="project-tag-btn ${state.projectTechFilter.toLowerCase() === tag.toLowerCase() ? 'active' : ''}"
                  data-card-tag="${escapeHtml(tag)}"
                >${escapeHtml(tag)}</button>
              `).join('')}
            </div>

            <div class="project-card-footer">
              <div class="project-links-mini">
                <a href="${escapeHtml(proj.repoUrl)}" target="_blank" rel="noopener noreferrer" data-stop-card>GitHub ↗</a>
                <a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" data-stop-card>Live ↗</a>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-explore-btn="${escapeHtml(proj.id)}">
                Explore Project →
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Wire events on rendered project cards
    $$('.project-card', grid).forEach((card) => {
      const projId = card.dataset.openProject;
      const proj = PROJECTS.find((p) => p.id === projId);
      if (!proj) return;

      wireMiniPreviewEvents(card, proj);

      // Clickable card tech tags highlight matching projects
      $$('[data-card-tag]', card).forEach((tagBtn) => {
        tagBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = tagBtn.dataset.cardTag;
          const togglingOff = state.projectTechFilter.toLowerCase() === tag.toLowerCase();
          state.projectTechFilter = togglingOff ? '' : tag;
          syncProjectFiltersAndRender();
          $$('[data-filter-skill]').forEach((sk) => {
            sk.classList.toggle('is-filtered', !togglingOff && sk.dataset.filterSkill.toLowerCase() === tag.toLowerCase());
          });
          const inlineClearBtn = $('#clear-skill-filter-inline');
          if (inlineClearBtn) inlineClearBtn.hidden = togglingOff;
          showToast(togglingOff ? 'Cleared skill highlight' : `Highlighted projects using "${tag}"`);
        });
      });

      $$('[data-stop-card]', card).forEach((a) => {
        a.addEventListener('click', (e) => e.stopPropagation());
      });

      const exploreBtn = $(`[data-explore-btn="${CSS.escape(projId)}"]`, card);
      if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openProjectModal(projId);
        });
      }

      card.addEventListener('click', () => openProjectModal(projId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProjectModal(projId);
        }
      });
    });
  }

  function initProjects() {
    initCaseStudyModal();
    syncProjectFiltersAndRender();
  }

  // -------------------- CASE STUDY MODAL + LIVE DEMOS --------------------
  function initCaseStudyModal() {
    const overlay = $('#project-modal');
    const closeBtn = $('#pm-close-btn');
    const prevBtn = $('#pm-prev-btn');
    const nextBtn = $('#pm-next-btn');
    const tabs = $$('[data-pm-tab]');

    if (!overlay) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.activeModalTab = tab.dataset.pmTab;
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
        });
        renderModalBody();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeProjectModal();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.activeModalProjectIndex = (state.activeModalProjectIndex - 1 + PROJECTS.length) % PROJECTS.length;
        renderProjectModal();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.activeModalProjectIndex = (state.activeModalProjectIndex + 1) % PROJECTS.length;
        renderProjectModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) closeProjectModal();
    });
  }

  function openProjectModal(projectId) {
    const idx = PROJECTS.findIndex((p) => p.id === projectId);
    if (idx === -1) return;
    state.activeModalProjectIndex = idx;
    state.activeModalTab = 'overview';
    state.lastFocusedElement = document.activeElement;

    const overlay = $('#project-modal');
    $$('[data-pm-tab]').forEach((t) => {
      const active = t.dataset.pmTab === 'overview';
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });

    renderProjectModal();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = $('#pm-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeProjectModal() {
    const overlay = $('#project-modal');
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  function renderProjectModal() {
    const proj = PROJECTS[state.activeModalProjectIndex];
    if (!proj) return;

    $('#pm-category').textContent = proj.category;
    $('#pm-impact').textContent = proj.impactBadge;
    $('#pm-title').textContent = proj.title;
    $('#pm-subtitle').textContent = proj.subtitle;
    $('#pm-live-link').href = proj.liveUrl || '#';
    $('#pm-repo-link').href = proj.repoUrl || '#';

    renderModalBody();
  }

  function renderModalBody() {
    const proj = PROJECTS[state.activeModalProjectIndex];
    const body = $('#pm-body');
    if (!proj || !body) return;

    if (state.activeModalTab === 'overview') {
      body.innerHTML = `
        <div class="case-section-block">
          <h3>Business Problem</h3>
          <p>${escapeHtml(proj.overview.problem)}</p>
        </div>
        <div class="case-section-block">
          <h3>Dataset &amp; Signal Scope</h3>
          <p>${escapeHtml(proj.overview.dataset)}</p>
        </div>
        <div class="case-section-block">
          <h3>Modeling &amp; Engineering Solution</h3>
          <p>${escapeHtml(proj.overview.solution)}</p>
        </div>
        <div class="case-section-block">
          <h3>Core Tech Stack</h3>
          <div class="timeline-tags">
            ${(proj.tags || []).map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      `;
    } else if (state.activeModalTab === 'pipeline') {
      body.innerHTML = `
        <div class="case-section-block">
          <h3>End-to-End ML Architecture</h3>
          <p>Modular stages designed for reproducibility, data quality checks, and low-latency production inference.</p>
        </div>
        <div class="pipeline-flow">
          ${(proj.pipeline || []).map((st) => `
            <div class="pipeline-stage">
              <span class="pipeline-step-num">STAGE ${escapeHtml(st.step)}</span>
              <h4>${escapeHtml(st.title)}</h4>
              <p>${escapeHtml(st.detail)}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (state.activeModalTab === 'demo') {
      renderModalLiveDemo(proj, body);
    } else if (state.activeModalTab === 'results') {
      body.innerHTML = `
        <div class="results-grid">
          ${(proj.results.metrics || []).map((m) => `
            <div class="result-metric-card">
              <span class="result-metric-val">${escapeHtml(m.value)}</span>
              <span class="result-metric-lbl">${escapeHtml(m.label)}</span>
            </div>
          `).join('')}
        </div>
        <div class="case-section-block">
          <h3>Validation &amp; Impact Highlights</h3>
          <ul class="timeline-bullets">
            ${(proj.results.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  function renderModalLiveDemo(proj, container) {
    if (proj.miniPreviewType === 'churn') {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Interactive Churn Scoring &amp; SHAP Driver Simulator</h3>
          <p style="margin:0 0 16px; color:var(--text-secondary); font-size:0.9rem;">
            Adjust account telemetry below to run a client-side logistic risk model and inspect local feature contributions.
          </p>
          <div class="form-row-2">
            <div>
              <div class="slider-control" style="margin-bottom:10px;">
                <div class="slider-head"><label for="dm-churn-usage">30d Usage Drop</label><span class="mono slider-val" id="dm-churn-u-val">35%</span></div>
                <input type="range" id="dm-churn-usage" min="0" max="85" value="35" />
              </div>
              <div class="slider-control" style="margin-bottom:10px;">
                <div class="slider-head"><label for="dm-churn-tix">Support Escalations</label><span class="mono slider-val" id="dm-churn-t-val">4</span></div>
                <input type="range" id="dm-churn-tix" min="0" max="10" value="4" />
              </div>
              <div class="slider-control" style="margin-bottom:10px;">
                <div class="slider-head"><label for="dm-churn-ten">Tenure (Months)</label><span class="mono slider-val" id="dm-churn-ten-val">8 mo</span></div>
                <input type="range" id="dm-churn-ten" min="1" max="36" value="8" />
              </div>
              <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
                <input type="checkbox" id="dm-churn-annual" />
                <span>Annual Auto-Renew Contract (reduces churn odds)</span>
              </label>
            </div>
            <div class="mini-stat-box" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <span class="mini-stat-label mono">Predicted 60-Day Churn Probability</span>
                <strong class="result-metric-val" id="dm-churn-prob" style="font-size:2.1rem;">64%</strong>
                <span class="mono" id="dm-churn-tier" style="font-size:0.84rem;">Tier: Immediate CS Outreach</span>
              </div>
              <div id="dm-churn-shap" style="margin-top:14px; font-size:0.8rem;"></div>
            </div>
          </div>
        </div>
      `;

      const uEl = $('#dm-churn-usage', container);
      const tEl = $('#dm-churn-tix', container);
      const tenEl = $('#dm-churn-ten', container);
      const annEl = $('#dm-churn-annual', container);

      const update = () => {
        const u = Number(uEl.value);
        const t = Number(tEl.value);
        const ten = Number(tenEl.value);
        const annual = annEl.checked;
        $('#dm-churn-u-val', container).textContent = `${u}%`;
        $('#dm-churn-t-val', container).textContent = `${t}`;
        $('#dm-churn-ten-val', container).textContent = `${ten} mo`;

        const cUsage = (u - 20) * 0.042;
        const cTix = (t - 2) * 0.34;
        const cTenure = (12 - ten) * 0.045;
        const cAnnual = annual ? -0.95 : 0.35;
        const z = -0.3 + cUsage + cTix + cTenure + cAnnual;
        const p = Math.round((1 / (1 + Math.exp(-z))) * 100);

        const probEl = $('#dm-churn-prob', container);
        probEl.textContent = `${p}%`;
        probEl.style.color = p >= 60 ? 'var(--accent-rose)' : p >= 35 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
        $('#dm-churn-tier', container).textContent =
          p >= 60 ? 'Action: Executive Sponsor Outreach + Usage Audit' : p >= 35 ? 'Action: Automated Adoption Nudge' : 'Action: Healthy — Standard Cadence';

        const drivers = [
          { name: 'Usage Drop', val: cUsage },
          { name: 'Support Tickets', val: cTix },
          { name: 'Tenure Effect', val: cTenure },
          { name: 'Contract Type', val: cAnnual }
        ];
        $('#dm-churn-shap', container).innerHTML = `
          <div class="mono" style="margin-bottom:6px; color:var(--text-muted);">Local Feature Attribution (Log-Odds):</div>
          ${drivers.map((d) => {
            const w = Math.min(100, Math.round(Math.abs(d.val) * 35));
            const color = d.val >= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)';
            return `
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                <span style="width:110px;">${d.name}</span>
                <div style="flex:1; height:6px; background:var(--bg-primary); border-radius:4px; overflow:hidden;">
                  <div style="width:${w}%; height:100%; background:${color};"></div>
                </div>
                <span class="mono" style="width:46px; text-align:right; color:${color};">${d.val >= 0 ? '+' : ''}${d.val.toFixed(2)}</span>
              </div>
            `;
          }).join('')}
        `;
      };
      [uEl, tEl, tenEl, annEl].forEach((el) => el.addEventListener('input', update));
      update();
    } else if (proj.miniPreviewType === 'forecast') {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Interactive Demand &amp; Promo Elasticity Simulator</h3>
          <p style="margin:0 0 14px; color:var(--text-secondary); font-size:0.9rem;">
            Tune seasonal amplitude and promo lift to preview P10–P90 demand uncertainty across a 28-day horizon.
          </p>
          <div class="form-row-2" style="margin-bottom:14px;">
            <div class="slider-control">
              <div class="slider-head"><label for="dm-fc-promo">Promo Discount Lift</label><span class="mono slider-val" id="dm-fc-pval">20%</span></div>
              <input type="range" id="dm-fc-promo" min="0" max="50" value="20" />
            </div>
            <div class="slider-control">
              <div class="slider-head"><label for="dm-fc-seas">Seasonality Volatility</label><span class="mono slider-val" id="dm-fc-sval">Medium</span></div>
              <input type="range" id="dm-fc-seas" min="5" max="35" value="18" />
            </div>
          </div>
          <svg id="dm-fc-svg" viewBox="0 0 600 180" style="width:100%; height:190px; background:var(--bg-primary); border-radius:10px; border:1px solid var(--border-subtle);"></svg>
          <div class="mono" id="dm-fc-summary" style="margin-top:10px; font-size:0.84rem; color:var(--accent-cyan-text);"></div>
        </div>
      `;
      const pSlider = $('#dm-fc-promo', container);
      const sSlider = $('#dm-fc-seas', container);
      const svg = $('#dm-fc-svg', container);
      const summary = $('#dm-fc-summary', container);

      const draw = () => {
        const promo = Number(pSlider.value);
        const amp = Number(sSlider.value);
        $('#dm-fc-pval', container).textContent = `${promo}%`;
        $('#dm-fc-sval', container).textContent = amp > 24 ? 'High' : amp > 14 ? 'Medium' : 'Low';

        const days = 28;
        const w = 600;
        const h = 180;
        const pad = 20;
        let sumUnits = 0;
        const pts = Array.from({ length: days }, (_, i) => {
          const promoPulse = i >= 10 && i <= 16 ? promo * 1.4 : 0;
          const val = 100 + Math.sin(i * 0.65) * amp + i * 0.9 + promoPulse;
          sumUnits += val;
          return val;
        });

        const maxV = Math.max(...pts) + 30;
        const minV = Math.max(0, Math.min(...pts) - 30);
        const scaleY = (v) => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);
        const stepX = (w - pad * 2) / (days - 1);

        const line = pts.map((v, i) => `${(pad + i * stepX).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
        const upper = pts.map((v, i) => `${(pad + i * stepX).toFixed(1)},${scaleY(v + amp * 0.85).toFixed(1)}`);
        const lower = pts.map((v, i) => `${(pad + i * stepX).toFixed(1)},${scaleY(v - amp * 0.85).toFixed(1)}`).reverse();

        svg.innerHTML = `
          <polygon points="${[...upper, ...lower].join(' ')}" fill="var(--accent-cyan)" fill-opacity="0.18"/>
          <polyline points="${line}" fill="none" stroke="var(--accent-cyan)" stroke-width="2.6"/>
        `;
        summary.textContent = `28-Day Forecasted Demand: ${Math.round(sumUnits).toLocaleString()} units · Recommended Safety Buffer: +${Math.round(amp * 1.6)} units/day`;
      };
      pSlider.addEventListener('input', draw);
      sSlider.addEventListener('input', draw);
      draw();
    } else if (proj.miniPreviewType === 'sentiment') {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Interactive NLP Triage &amp; Token Attribution Workbench</h3>
          <p style="margin:0 0 12px; color:var(--text-secondary); font-size:0.9rem;">
            Enter any support message to inspect intent routing, SLA urgency, and keyword polarity weights.
          </p>
          <textarea id="dm-nlp-text" class="csv-textarea mono" rows="3">Our export pipeline timed out twice and billing charged our card again — urgent help needed!</textarea>
          <div class="results-grid" style="margin-bottom:12px;">
            <div class="result-metric-card"><span class="result-metric-lbl">Predicted Intent</span><strong class="result-metric-val" id="dm-nlp-intent" style="font-size:1.25rem; color:var(--accent-cyan-text);">Billing</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">SLA Priority</span><strong class="result-metric-val" id="dm-nlp-urgency" style="font-size:1.25rem;">Escalate</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">Polarity Score</span><strong class="result-metric-val" id="dm-nlp-score" style="font-size:1.25rem;">-2.8</strong></div>
          </div>
          <div id="dm-nlp-tokens" class="timeline-tags"></div>
        </div>
      `;
      const ta = $('#dm-nlp-text', container);
      const run = () => {
        const res = analyzeTicketText(ta.value);
        $('#dm-nlp-intent', container).textContent = res.intent;
        const urgEl = $('#dm-nlp-urgency', container);
        urgEl.textContent = res.urgency;
        urgEl.style.color = res.urgency === 'Escalate' ? 'var(--accent-rose)' : res.urgency === 'Positive' ? 'var(--accent-emerald)' : 'var(--accent-cyan-text)';
        $('#dm-nlp-score', container).textContent = res.score.toFixed(1);
        $('#dm-nlp-tokens', container).innerHTML = res.matched.length
          ? res.matched.map((m) => `<span class="tech-pill" style="border-color:${m.weight > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${escapeHtml(m.word)} (${m.weight > 0 ? '+' : ''}${m.weight})</span>`).join('')
          : '<span class="mono" style="font-size:0.8rem; color:var(--text-muted);">No strong polarity tokens detected — neutral routing.</span>';
      };
      ta.addEventListener('input', run);
      run();
    } else if (proj.miniPreviewType === 'threshold') {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Cost-Sensitive Fraud Decision Threshold Optimizer</h3>
          <p style="margin:0 0 14px; color:var(--text-secondary); font-size:0.9rem;">
            Balance caught fraud against false customer declines using your business cost ratio.
          </p>
          <div class="slider-control" style="margin-bottom:16px;">
            <div class="slider-head"><label for="dm-fr-thr">Probability Cutoff Threshold</label><span class="mono slider-val" id="dm-fr-tval">0.70</span></div>
            <input type="range" id="dm-fr-thr" min="0.30" max="0.95" step="0.05" value="0.70" />
          </div>
          <div class="results-grid">
            <div class="result-metric-card"><span class="result-metric-lbl">Precision</span><strong class="result-metric-val" id="dm-fr-prec">91%</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">Fraud Recall</span><strong class="result-metric-val" id="dm-fr-rec">84%</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">Est. Net Monthly Savings</span><strong class="result-metric-val" id="dm-fr-sav">$52K</strong></div>
          </div>
        </div>
      `;
      const sl = $('#dm-fr-thr', container);
      const upd = () => {
        const thr = Number(sl.value);
        $('#dm-fr-tval', container).textContent = thr.toFixed(2);
        const prec = Math.min(99, Math.round(62 + thr * 41));
        const rec = Math.max(46, Math.round(106 - thr * 34));
        const net = Math.round(rec * 0.9 - (100 - prec) * 1.4);
        $('#dm-fr-prec', container).textContent = `${prec}%`;
        $('#dm-fr-rec', container).textContent = `${rec}%`;
        $('#dm-fr-sav', container).textContent = `$${Math.max(12, net)}K`;
      };
      sl.addEventListener('input', upd);
      upd();
    } else if (proj.miniPreviewType === 'vision') {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Interactive Optical PCB Defect Inspector</h3>
          <p style="margin:0 0 14px; color:var(--text-secondary); font-size:0.9rem;">
            Adjust confidence threshold on a synthetic board scan to observe bounding box filtering and QA pass/reject logic.
          </p>
          <div class="slider-control" style="margin-bottom:14px;">
            <div class="slider-head"><label for="dm-vis-thr">Detection Confidence Cutoff</label><span class="mono slider-val" id="dm-vis-val">0.65</span></div>
            <input type="range" id="dm-vis-thr" min="0.40" max="0.95" step="0.05" value="0.65" />
          </div>
          <svg id="dm-vis-svg" viewBox="0 0 520 170" style="width:100%; height:175px; background:#091914; border-radius:10px; border:1px solid var(--border-strong);"></svg>
        </div>
      `;
      const sl = $('#dm-vis-thr', container);
      const svg = $('#dm-vis-svg', container);
      const boxes = [
        { x: 65, y: 38, w: 95, h: 64, label: 'Solder Bridge', conf: 0.93 },
        { x: 245, y: 55, w: 80, h: 52, label: 'Missing Pad', conf: 0.78 },
        { x: 390, y: 42, w: 72, h: 58, label: 'Flux Glare', conf: 0.52 }
      ];
      const draw = () => {
        const cut = Number(sl.value);
        $('#dm-vis-val', container).textContent = cut.toFixed(2);
        const traces = `
          <rect x="20" y="18" width="480" height="134" rx="8" fill="#0d2b22" stroke="#1f6f54" stroke-width="2"/>
          <path d="M50 50 H460 M50 95 H460 M110 30 V140 M280 30 V140 M420 30 V140" stroke="#1e5642" stroke-width="4" opacity="0.7"/>
        `;
        const rects = boxes.filter((b) => b.conf >= cut).map((b) => `
          <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="rgba(251,113,133,0.18)" stroke="#fb7185" stroke-width="2.2"/>
          <text x="${b.x}" y="${b.y - 6}" fill="#fda4af" font-size="11" font-family="monospace">${b.label} (${b.conf.toFixed(2)})</text>
        `).join('');
        svg.innerHTML = traces + rects;
      };
      sl.addEventListener('input', draw);
      draw();
    } else {
      container.innerHTML = `
        <div class="demo-workbench">
          <h3 style="margin:0 0 8px;">Two-Proportion A/B Hypothesis Test Calculator</h3>
          <p style="margin:0 0 14px; color:var(--text-secondary); font-size:0.9rem;">
            Test experiment metrics directly using a live pooled two-sided Z-test.
          </p>
          <div class="form-row-2" style="margin-bottom:14px;">
            <div class="form-field" style="margin:0;">
              <label for="dm-ab-n1">Control Visitors</label>
              <input type="number" id="dm-ab-n1" value="12000" min="100" />
            </div>
            <div class="form-field" style="margin:0;">
              <label for="dm-ab-c1">Control Conversions</label>
              <input type="number" id="dm-ab-c1" value="504" min="1" />
            </div>
            <div class="form-field" style="margin:0;">
              <label for="dm-ab-n2">Variant Visitors</label>
              <input type="number" id="dm-ab-n2" value="12000" min="100" />
            </div>
            <div class="form-field" style="margin:0;">
              <label for="dm-ab-c2">Variant Conversions</label>
              <input type="number" id="dm-ab-c2" value="576" min="1" />
            </div>
          </div>
          <div class="results-grid">
            <div class="result-metric-card"><span class="result-metric-lbl">Relative Lift</span><strong class="result-metric-val" id="dm-ab-lift">+14.3%</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">Z-Score</span><strong class="result-metric-val" id="dm-ab-z">2.25</strong></div>
            <div class="result-metric-card"><span class="result-metric-lbl">p-value (2-sided)</span><strong class="result-metric-val" id="dm-ab-p">0.024</strong></div>
          </div>
        </div>
      `;
      const inputs = ['#dm-ab-n1', '#dm-ab-c1', '#dm-ab-n2', '#dm-ab-c2'].map((s) => $(s, container));
      const calc = () => {
        const [n1, c1, n2, c2] = inputs.map((el) => Math.max(1, Number(el.value)));
        const res = computeAbStats(n1, Math.min(n1, c1), n2, Math.min(n2, c2));
        $('#dm-ab-lift', container).textContent = `${res.relLift >= 0 ? '+' : ''}${res.relLift.toFixed(1)}%`;
        $('#dm-ab-z', container).textContent = res.z.toFixed(2);
        const pEl = $('#dm-ab-p', container);
        pEl.textContent = res.pVal.toFixed(4);
        pEl.style.color = res.pVal < 0.05 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
      };
      inputs.forEach((el) => el.addEventListener('input', calc));
      calc();
    }
  }

  // -------------------- 8. CERTIFICATIONS, CONTACT & RESUME MODAL --------------------
  function initCertifications() {
    const grid = $('#certifications-grid');
    if (!grid || !Array.isArray(DATA.certifications)) return;

    grid.innerHTML = DATA.certifications.map((cert) => `
      <article class="cert-card reveal">
        <div>
          <div class="cert-top">
            <div class="cert-icon-box" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <span class="badge badge-accent mono">${escapeHtml(cert.badgeType)}</span>
          </div>
          <h3 class="cert-title" style="margin-top:14px;">${escapeHtml(cert.title)}</h3>
          <p class="cert-issuer">${escapeHtml(cert.issuer)} · ${escapeHtml(cert.date)}</p>
          <div class="timeline-tags">
            ${(cert.skills || []).map((s) => `<span class="tech-pill">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding-top:10px; border-top:1px solid var(--border-subtle);">
          <span class="cert-meta mono">ID: ${escapeHtml(cert.credentialId)}</span>
         <button 
           type="button" 
           onclick="openCertModal('${escapeHtml(cert.certificateFile)}', '${cert.title}')"
           class="cert-btn" 
         >
          ${cert.buttonText || "Check Certificate"}
         </button>
        </div>
      </article>
    `).join('');
  }

  function initContact() {
    const channelsEl = $('#contact-channels');
    const profile = DATA.profile || {};
    const socials = Array.isArray(DATA.socials) ? DATA.socials : [];

    if (channelsEl) {
      const socialCards = socials.map((s) => `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="channel-card">
          <div class="channel-left">
            <div class="channel-icon mono">${escapeHtml(s.label.slice(0, 2).toUpperCase())}</div>
            <div>
              <span class="channel-label">${escapeHtml(s.label)}</span>
              <span class="channel-value">${escapeHtml(s.handle)}</span>
            </div>
          </div>
          <span class="mono" aria-hidden="true">↗</span>
        </a>
      `).join('');

      channelsEl.innerHTML = `
        <div class="channel-card">
          <div class="channel-left">
            <div class="channel-icon">@</div>
            <div>
              <span class="channel-label">Direct Email</span>
              <span class="channel-value">${escapeHtml(profile.email || 'harivansh@example.com')}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="contact-copy-email-btn">Copy</button>
        </div>
        ${socialCards}
      `;

      const copyBtn = $('#contact-copy-email-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => copyText(profile.email, `Copied ${profile.email}`));
      }
    }

    // Contact Form Real-Time Validation
    const form = $('#contact-form');
    if (!form) return;

    const nameIn = $('#contact-name');
    const emailIn = $('#contact-email');
    const subjIn = $('#contact-subject');
    const msgIn = $('#contact-message');
    const charCounter = $('#message-char-counter');

    const validators = {
      name: (val) => val.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).',
      email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.',
      subject: (val) => val.trim().length >= 3 ? '' : 'Please enter a brief subject.',
      message: (val) => val.trim().length >= 10 ? '' : 'Please write at least 10 characters so I can respond meaningfully.'
    };

    function validateField(input, key) {
      const errSpan = $(`#error-${key}`);
      const msg = validators[key](input.value);
      input.setAttribute('aria-invalid', String(Boolean(msg)));
      if (errSpan) errSpan.textContent = msg;
      return !msg;
    }

    [[nameIn, 'name'], [emailIn, 'email'], [subjIn, 'subject'], [msgIn, 'message']].forEach(([el, key]) => {
      if (!el) return;
      el.addEventListener('blur', () => validateField(el, key));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') validateField(el, key);
        if (key === 'message' && charCounter) {
          charCounter.textContent = `${el.value.length} / 1000`;
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const okName = validateField(nameIn, 'name');
      const okEmail = validateField(emailIn, 'email');
      const okSubj = validateField(subjIn, 'subject');
      const okMsg = validateField(msgIn, 'message');

      if (!okName || !okEmail || !okSubj || !okMsg) {
        showToast('Please fix the highlighted fields before sending.', 'error');
        return;
      }

      const endpoint = (form.dataset.formspreeUrl || '').trim();
      const submitBtn = $('#contact-submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (endpoint) {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
          });
          if (!resp.ok) throw new Error('Submission failed');
        }
        form.reset();
        if (charCounter) charCounter.textContent = '0 / 1000';
        showToast(
          endpoint
            ? 'Message sent! Thank you — Harivansh will reply shortly.'
            : 'Validated & sent in demo mode! Connect Formspree or Netlify in index.html for live delivery.'
        );
      } catch (err) {
        showToast('Could not submit right now. Try copying the email directly.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // -------------------- RESUME PREVIEW MODAL --------------------
  function initResumeModal() {
    const openBtn = $('#open-resume-btn');
    const overlay = $('#resume-modal');
    const closeBtn = $('#resume-close-btn');
    const printBtn = $('#resume-print-btn');
    const dlLink = $('#resume-download-link');
    const sheet = $('#resume-sheet-content');

    if (!overlay || !sheet) return;

    function renderResumeContent() {
      const p = DATA.profile || {};
      const work = (DATA.timeline || []).filter((t) => t.kind === 'work');
      const edu = (DATA.timeline || []).filter((t) => t.kind === 'education');
      const topProjects = PROJECTS.slice(0, 3);
      const skillSummary = (DATA.skills || [])
        .map((cat) => `<strong>${escapeHtml(cat.tabLabel)}:</strong> ${cat.items.map((i) => escapeHtml(i.name)).join(', ')}`)
        .join('<br/>');

      sheet.innerHTML = `
        <div class="resume-top">
          <h1>${escapeHtml(p.name || 'Harivansh')} — ${escapeHtml(p.headlineRole || 'Data Scientist')}</h1>
          <div class="resume-contact-line">
            ${escapeHtml(p.location || '')} · ${escapeHtml(p.email || '')} ·
            ${(DATA.socials || []).map((s) => escapeHtml(s.handle)).join(' · ')}
          </div>
        </div>

        <div class="resume-sec">
          <h2>Summary</h2>
          <p style="margin:0; font-size:0.9rem; color:#334155;">${escapeHtml(p.bio || '')}</p>
        </div>

        <div class="resume-sec">
          <h2>Technical Skills</h2>
          <p style="margin:0; font-size:0.86rem; line-height:1.55; color:#334155;">${skillSummary}</p>
        </div>

        <div class="resume-sec">
          <h2>Experience</h2>
          ${work.map((item) => `
            <div class="resume-item">
              <div class="resume-item-head">
                <span>${escapeHtml(item.role)} — ${escapeHtml(item.org)}</span>
                <span>${escapeHtml(item.period)}</span>
              </div>
              <ul>${(item.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
            </div>
          `).join('')}
        </div>

        <div class="resume-sec">
          <h2>Selected Projects</h2>
          ${topProjects.map((proj) => `
            <div class="resume-item">
              <div class="resume-item-head">
                <span>${escapeHtml(proj.title)} (${escapeHtml(proj.impactBadge)})</span>
                <span>${escapeHtml((proj.tags || []).slice(0, 4).join(', '))}</span>
              </div>
              <ul><li>${escapeHtml(proj.summary)}</li></ul>
            </div>
          `).join('')}
        </div>

        <div class="resume-sec" style="margin-bottom:0;">
          <h2>Education &amp; Credentials</h2>
          ${edu.map((e) => `
            <div class="resume-item">
              <div class="resume-item-head">
                <span>${escapeHtml(e.role)} — ${escapeHtml(e.org)}</span>
                <span>${escapeHtml(e.period)}</span>
              </div>
            </div>
          `).join('')}
          <p style="margin:6px 0 0; font-size:0.86rem; color:#334155;">
            <strong>Certifications:</strong> ${(DATA.certifications || []).slice(0, 4).map((c) => escapeHtml(c.title)).join(' · ')}
          </p>
        </div>
      `;
    }

    if (openBtn) openBtn.addEventListener('click', openResumeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeResumeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeResumeModal();
    });

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (dlLink) {
      const pdfUrl = (DATA.profile && DATA.profile.resumePdfUrl) || '';
      if (pdfUrl) {
        dlLink.href = pdfUrl;
      } else {
        dlLink.addEventListener('click', (e) => {
          e.preventDefault();
          showToast('No static PDF linked yet — opening Save as PDF print dialog!');
          window.print();
        });
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) closeResumeModal();
    });

    renderResumeContent();
  }

  function openResumeModal() {
    const overlay = $('#resume-modal');
    if (!overlay) return;
    state.lastFocusedElement = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = $('#resume-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeResumeModal() {
    const overlay = $('#resume-modal');
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  // -------------------- 9. COMMAND PALETTE (CTRL+K / CMD+K) --------------------
  let openCommandPalette = () => {};

  function initCommandPalette() {
    const overlay = $('#cmd-modal');
    const triggerBtn = $('#cmd-trigger-btn');
    const input = $('#cmd-input');
    const resultsEl = $('#cmd-results');
    if (!overlay || !input || !resultsEl) return;

    let activeIndex = 0;
    let currentItems = [];

    function buildCommandList() {
      const navItems = [
        { group: 'Sections', title: 'About & Hero', meta: '#about', run: () => scrollToSection('#about') },
        { group: 'Sections', title: 'Interactive Skills Matrix', meta: '#skills', run: () => scrollToSection('#skills') },
        { group: 'Sections', title: 'Experience & Education', meta: '#experience', run: () => scrollToSection('#experience') },
        { group: 'Sections', title: 'Projects Showcase', meta: '#projects', run: () => scrollToSection('#projects') },
        { group: 'Sections', title: 'Certifications & Achievements', meta: '#certifications', run: () => scrollToSection('#certifications') },
        { group: 'Sections', title: 'Contact & Form', meta: '#contact', run: () => scrollToSection('#contact') }
      ];

      const projectItems = PROJECTS.map((p) => ({
        group: 'Projects',
        title: p.title,
        meta: `${p.category} · ${p.impactBadge}`,
        run: () => openProjectModal(p.id)
      }));

      const actionItems = [
        {
          group: 'Quick Actions',
          title: `Switch to ${state.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
          meta: 'Theme Toggle',
          run: () => applyTheme(state.theme === 'dark' ? 'light' : 'dark', true)
        },
        {
          group: 'Quick Actions',
          title: 'Open Resume Preview & PDF Export',
          meta: 'Resume Modal',
          run: () => openResumeModal()
        },
        {
          group: 'Quick Actions',
          title: 'Copy Harivansh Email Address',
          meta: (DATA.profile && DATA.profile.email) || 'Copy',
          run: () => copyText((DATA.profile && DATA.profile.email) || '', 'Email copied!')
        }
      ];

      return [...actionItems, ...navItems, ...projectItems];
    }

    function scrollToSection(hash) {
      const target = $(hash);
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    }

    function renderList() {
      const q = input.value.trim().toLowerCase();
      const all = buildCommandList();
      currentItems = q
        ? all.filter((item) => `${item.title} ${item.meta} ${item.group}`.toLowerCase().includes(q))
        : all;

      if (activeIndex >= currentItems.length) activeIndex = 0;

      if (!currentItems.length) {
        resultsEl.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">No matching commands or projects.</div>`;
        return;
      }

      let html = '';
      let lastGroup = '';
      currentItems.forEach((item, idx) => {
        if (item.group !== lastGroup) {
          html += `<div class="cmd-group-label">${escapeHtml(item.group)}</div>`;
          lastGroup = item.group;
        }
        html += `
          <button
            type="button"
            class="cmd-item ${idx === activeIndex ? 'active' : ''}"
            role="option"
            aria-selected="${idx === activeIndex}"
            data-cmd-idx="${idx}"
          >
            <span class="cmd-item-title">${escapeHtml(item.title)}</span>
            <span class="cmd-item-meta mono">${escapeHtml(item.meta)}</span>
          </button>
        `;
      });
      resultsEl.innerHTML = html;

      $$('[data-cmd-idx]', resultsEl).forEach((btn) => {
        btn.addEventListener('click', () => executeIndex(Number(btn.dataset.cmdIdx)));
      });
      const activeBtn = $('.cmd-item.active', resultsEl);
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ block: 'nearest' });
      }
    }

    function executeIndex(idx) {
      const item = currentItems[idx];
      if (!item) return;
      closePalette();
      item.run();
    }

    openCommandPalette = () => {
      state.lastFocusedElement = document.activeElement;
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      activeIndex = 0;
      renderList();
      input.focus();
    };

    function closePalette() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
        state.lastFocusedElement.focus();
      }
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openCommandPalette);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });

    input.addEventListener('input', () => {
      activeIndex = 0;
      renderList();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentItems.length) {
          activeIndex = (activeIndex + 1) % currentItems.length;
          renderList();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentItems.length) {
          activeIndex = (activeIndex - 1 + currentItems.length) % currentItems.length;
          renderList();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeIndex(activeIndex);
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.hidden) openCommandPalette();
        else closePalette();
      } else if (e.key === 'Escape' && !overlay.hidden) {
        closePalette();
      }
    });
  }

  // -------------------- SCROLL REVEAL & COPYRIGHT --------------------
  function initRevealAndFooter() {
    const yearEl = $('#copyright-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const targets = $$('.reveal');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((el) => obs.observe(el));
  }

  // -------------------- BOOTSTRAP APPLICATION --------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initHero();
    initSkillsMatrix();
    initTimeline();
    initProjects();
    initCertifications();
    initContact();
    initResumeModal();
    initCommandPalette();
    initRevealAndFooter();
  });
})();

function openCertModal(fileUrl, title) {
  const modal = document.getElementById("certModal");
  const modalBox = document.getElementById("certModalBox");
  const modalBody = document.getElementById("certModalBody");
  const modalTitle = document.getElementById("certModalTitle");
  const downloadBtn = document.getElementById("certDownloadBtn");

  modalTitle.innerText = title || "Certificate";
  downloadBtn.href = fileUrl;

  if (fileUrl.toLowerCase().endsWith(".pdf")) {
    modalBody.innerHTML = `<iframe src="${fileUrl}" style="width:100%; height:100%; border:none; border-radius:8px; background:#fff;"></iframe>`;
  } else {
    modalBody.innerHTML = `<img src="${fileUrl}" alt="${title}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;" />`;
  }

  modal.style.display = "flex";
  
  // Smooth Pop Animation
  setTimeout(() => {
    modal.style.opacity = "1";
    modalBox.style.transform = "scale(1)";
  }, 10);
}

function closeCertModal() {
  const modal = document.getElementById("certModal");
  const modalBox = document.getElementById("certModalBox");
  const modalBody = document.getElementById("certModalBody");

  modal.style.opacity = "0";
  modalBox.style.transform = "scale(0.85)";

  setTimeout(() => {
    modal.style.display = "none";
    modalBody.innerHTML = "";
  }, 250);
}

