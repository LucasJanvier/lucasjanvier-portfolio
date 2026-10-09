
    (() => {
      const loader = document.getElementById('loader');
      const menuToggle = document.getElementById('menuToggle');
      const navLinks = document.getElementById('navLinks');
      const links = [...document.querySelectorAll('.nav-link')];
      const sections = [...document.querySelectorAll('main section[id]')];
      const reveals = [...document.querySelectorAll('.reveal')];

      // Loading screen: give the opening animation enough time to read, then reveal the site.
      window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('is-hidden'), 1450);
      });

      // Mobile navigation.
      const closeMenu = () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      };

      menuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
      });

      links.forEach(link => {
        link.addEventListener('click', () => closeMenu());
      });

      // Reveal elements as they enter the viewport.
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      reveals.forEach(el => revealObserver.observe(el));

      // Highlight the navigation item belonging to the visible section.
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, {
        threshold: 0.35,
        rootMargin: '-10% 0px -55% 0px'
      });

      sections.forEach(section => sectionObserver.observe(section));

      // Small, restrained parallax effect on the hero title.
      const heroTitle = document.querySelector('.hero__title');
      let ticking = false;

      const updateParallax = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const y = Math.min(window.scrollY * 0.08, 55);
        heroTitle.style.transform = `translate3d(0, ${y}px, 0)`;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });

      // Close mobile menu with Escape.
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });
    })();
