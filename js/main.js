document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Switching System ---
  const themeToggle = document.querySelector('.theme-toggle');
  
  // Set up theme toggle HTML if not present
  if (themeToggle) {
    const updateThemeIcon = (theme) => {
      if (theme === 'dark') {
        themeToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>`;
      } else {
        themeToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>`;
      }
    };

    // Retrieve active theme
    const activeTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    updateThemeIcon(activeTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
      updateThemeIcon(targetTheme);
    });
  } else {
    // If button doesn't exist, still load correct theme from storage
    const activeTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }

  // --- Mobile Navigation Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navElement = document.querySelector('nav');

  if (menuToggle && navElement) {
    menuToggle.addEventListener('click', () => {
      navElement.classList.toggle('open');
      menuToggle.textContent = navElement.classList.contains('open') ? '[ CLOSE ]' : '[ MENU ]';
    });
  }

  // --- Active Link Highlighting ---
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath === ''))) {
      link.classList.add('active');
    }
  });

  // --- FAQ Accordion (unified: one open at a time within its group) ---
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      if (!item) return;
      const wasOpen = item.classList.contains('active');
      const group = item.parentElement;
      group.querySelectorAll(':scope > .faq-item').forEach(sib => {
        sib.classList.remove('active');
        const si = sib.querySelector('.faq-icon');
        if (si) si.textContent = '+';
      });
      if (!wasOpen) {
        item.classList.add('active');
        const ic = item.querySelector('.faq-icon');
        if (ic) ic.textContent = '−';
      }
    });
  });

    // --- Screenshot Lightbox System ---
  const screenshotContainers = document.querySelectorAll('.screenshot-container');
  
  // Create lightbox markup dynamically if it doesn't exist
  let lightbox = document.querySelector('.lightbox-modal');
  if (!lightbox && screenshotContainers.length > 0) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-content" src="" alt="Zoomed Screenshot">
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lightbox);
  }

  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const lightboxCap = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    screenshotContainers.forEach(container => {
      container.addEventListener('click', () => {
        const img = container.querySelector('img');
        const caption = container.getAttribute('data-caption') || img.alt;
        
        lightboxImg.src = img.src;
        lightboxCap.textContent = caption;
        lightbox.style.display = 'flex';
      });
    });

    const closeLightbox = () => {
      lightbox.style.display = 'none';
      lightboxImg.src = '';
      lightboxCap.textContent = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
  }

  // --- Docs Layout ScrollSpy ---
  const docsSections = document.querySelectorAll('.docs-section');
  const docsNavLinks = document.querySelectorAll('.docs-nav-link');
  
  if (docsSections.length > 0 && docsNavLinks.length > 0) {
    const onScroll = () => {
      let current = '';
      
      docsSections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id');
        }
      });
      
      if (current) {
        docsNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').endsWith('#' + current)) {
            link.classList.add('active');
          }
        });
      }
    };
    
    window.addEventListener('scroll', onScroll);
    onScroll(); // Initialize on load
  }

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });
    
    revealElements.forEach(el => observer.observe(el));
  }
});

// FAQ accordion is handled by the unified handler above.



// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});


/* ============================================================
   PREMIUM ELEVATION — nav dropdown, scroll progress, stagger
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // --- Scroll progress bar ---
  let bar = document.getElementById('scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
  }
  const header = document.querySelector('header');
  const onScrollFx = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', scrolled > 20);
  };
  window.addEventListener('scroll', onScrollFx, { passive: true });
  onScrollFx();

  // --- Product dropdown ---
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html') || 'index.html';
  document.querySelectorAll('.nav-group').forEach(group => {
    const trigger = group.querySelector('.nav-trigger');
    // mark group active if the current page is one of its children
    const childHrefs = [...group.querySelectorAll('.nav-dropdown a')].map(a => a.getAttribute('href'));
    childHrefs.forEach(href => {
      if (href === currentFile) {
        group.classList.add('section-active');
        const link = group.querySelector('.nav-dropdown a[href="' + href + '"]');
        if (link) link.classList.add('active');
      }
    });
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const nowOpen = group.classList.toggle('open');
        trigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      });
    }
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-group.open').forEach(g => {
      if (!g.contains(e.target)) {
        g.classList.remove('open');
        const t = g.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-group.open').forEach(g => {
        g.classList.remove('open');
        const t = g.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // --- Staggered grid reveals ---
  const gridSel = '.grid-2, .grid-3, .grid-4, .marketing-bento, .bento-grid, .feature-grid, .flow-journey';
  const grids = document.querySelectorAll(gridSel);
  if (grids.length) {
    grids.forEach(grid => {
      grid.classList.add('fx-stagger');
      [...grid.children].forEach((child, i) => {
        child.style.setProperty('--fx-d', Math.min(i * 70, 520) + 'ms');
      });
    });
    const gObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx-in');
          gObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    grids.forEach(g => gObs.observe(g));
  }
});
