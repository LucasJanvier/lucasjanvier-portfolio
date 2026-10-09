(() => {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const progress = document.getElementById('progress');
  const cursor = document.getElementById('cursor');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const reveals = [...document.querySelectorAll('.reveal')];
  const heroTitle = document.querySelector('.hero__title');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Jaartal in de footer
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Thema: opgeslagen keuze, anders systeemvoorkeur
  const getStoredTheme = () => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  };
  const storeTheme = (value) => {
    try { localStorage.setItem('theme', value); } catch (e) { /* negeren */ }
  };
  const currentTheme = () =>
    root.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0e0d' : '#f5f5f3');
  };

  const saved = getStoredTheme();
  if (saved === 'dark' || saved === 'light') applyTheme(saved);

  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
  });

  // Loading screen: de titel wisselt door 20 lettertypes en blijft op het laatste staan,
  // daarna veegt het scherm weg en zie je de site.
  // Past je de lijst aan? Pas dan ook de Google Fonts-link in index.html aan.
  const LOADER_FONTS = [
    'Playfair Display', 'Bebas Neue', 'Pacifico', 'Space Mono', 'Abril Fatface',
    'Lobster', 'Orbitron', 'Permanent Marker', 'Cinzel', 'Righteous',
    'Dancing Script', 'Press Start 2P', 'Anton', 'Caveat', 'Monoton',
    'Special Elite', 'Bungee', 'Syncopate', 'DM Serif Display', 'Archivo Black'
  ];
  const FONT_STEP = 110;      // ms per lettertype
  const FINAL_HOLD = 900;     // ms dat het laatste lettertype blijft staan voor het wegvaagt
  const FONT_TIMEOUT = 3000;  // wacht maximaal zo lang op het laden van de lettertypes

  const loaderStage = document.getElementById('loaderStage');
  const loaderBrand = document.getElementById('loaderBrand');

  const finishLoading = () => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  };

  const showFont = (i) => {
    const name = LOADER_FONTS[i];
    loaderBrand.style.fontFamily = `"${name}", Arial, sans-serif`;
    loaderBrand.style.transform = 'none';

    // Brede lettertypes (zoals Press Start 2P) verkleinen zodat ze in beeld passen
    const available = loaderStage.clientWidth;
    const needed = loaderBrand.offsetWidth;
    if (needed > available) loaderBrand.style.transform = `scale(${available / needed})`;
  };

  const runLoader = () => {
    let i = 0;
    showFont(i);
    const timer = setInterval(() => {
      i += 1;
      showFont(i);
      if (i >= LOADER_FONTS.length - 1) {
        clearInterval(timer);
        setTimeout(finishLoading, FINAL_HOLD);
      }
    }, FONT_STEP);
  };

  const preloadFonts = () => {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const loads = LOADER_FONTS.map(name =>
      document.fonts.load(`1em "${name}"`, 'lucasjanvier').catch(() => null)
    );
    // Hang nooit vast als het laden van de fonts mislukt of te lang duurt
    return Promise.race([
      Promise.all(loads),
      new Promise(resolve => setTimeout(resolve, FONT_TIMEOUT))
    ]);
  };

  if (reduceMotion) {
    finishLoading();
  } else {
    preloadFonts().then(runLoader);
  }

  // Mobiel menu
  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menu openen');
  };

  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  });

  links.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Elementen onthullen bij scrollen
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // Actieve navigatie-link
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { threshold: 0.35, rootMargin: '-10% 0px -55% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  // Scroll: voortgangsbalk + subtiele parallax
  let ticking = false;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;

    if (!reduceMotion && heroTitle) {
      const y = Math.min(window.scrollY * 0.08, 55);
      heroTitle.style.transform = `translate3d(0, ${y}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  // Custom cursor (alleen met muis)
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasMouse && cursor && !reduceMotion) {
    let x = 0, y = 0, cx = 0, cy = 0;

    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add('is-active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));

    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();

    const hoverTargets = 'a, button, .project, .service';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }
})();