document.addEventListener('DOMContentLoaded', () => {
  // --- Force Dark Mode ---
  document.documentElement.setAttribute('data-theme', 'dark');

  // --- Mobile Navigation Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navElement = document.querySelector('nav');

  if (menuToggle && navElement) {
    menuToggle.addEventListener('click', () => {
      navElement.classList.toggle('open');
      menuToggle.textContent = navElement.classList.contains('open') ? '[ CLOSE ]' : '[ MENU ]';
    });
  }

  // --- Homepage Hero Carousel ---
  const carouselTabs = document.querySelectorAll('.terminal-carousel-tabs .terminal-tab');
  const carouselTitle = document.getElementById('terminal-carousel-title');
  if (carouselTabs.length > 0) {
    let rotationInterval;
    
    const selectTab = (tab) => {
      // Remove active state from all tabs
      carouselTabs.forEach(t => {
        t.classList.remove('active');
        t.style.color = 'var(--text-muted)';
        t.style.borderColor = 'transparent';
      });
      
      // Set active tab styling
      tab.classList.add('active');
      tab.style.color = 'var(--accent)';
      tab.style.borderColor = 'var(--accent)';
      
      // Switch active screenshot-container
      const targetId = tab.getAttribute('data-target');
      const containers = document.querySelectorAll('.terminal-window .screenshot-container');
      containers.forEach(container => {
        if (container.id === targetId) {
          container.style.display = 'block';
          container.classList.add('active');
        } else {
          container.style.display = 'none';
          container.classList.remove('active');
        }
      });
      
      // Update header subtitle right-aligned label
      if (targetId === 'carousel-client') {
        carouselTitle.textContent = 'client_view';
      } else if (targetId === 'carousel-shell') {
        carouselTitle.textContent = 'terminal_view';
      } else if (targetId === 'carousel-vault') {
        carouselTitle.textContent = 'vault_view';
      }
    };

    carouselTabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent lightbox trigger on tab click
        if (rotationInterval) {
          clearInterval(rotationInterval); // Stop auto-rotation if user interacts
        }
        selectTab(tab);
      });
    });

    // Start auto-rotation (rotate every 5 seconds)
    let currentIdx = 0;
    rotationInterval = setInterval(() => {
      currentIdx = (currentIdx + 1) % carouselTabs.length;
      selectTab(carouselTabs[currentIdx]);
    }, 5000);
  }


  // --- Active Link Highlighting ---
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath === ''))) {
      link.classList.add('active');
      // If it's a dropdown item, also highlight the parent Products dropdown toggle
      if (link.classList.contains('dropdown-item')) {
        const parentToggle = link.closest('.dropdown')?.querySelector('.dropdown-toggle');
        if (parentToggle) {
          parentToggle.classList.add('active');
        }
      }
    }
  });

  // --- FAQ Accordion Toggle ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all items
      document.querySelectorAll('.faq-item').forEach(faqItem => {
        faqItem.classList.remove('active');
      });
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
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

  // --- Click to Copy for pre code blocks ---
  document.querySelectorAll('pre').forEach(block => {
    // Skip if it is already styled differently
    if (block.querySelector('.copy-btn')) return;

    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = 'COPY';
    block.appendChild(button);

    button.addEventListener('click', () => {
      const code = block.querySelector('code');
      const text = code ? code.innerText : block.innerText.replace('COPY', '').trim();
      
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'COPIED!';
        button.style.color = 'var(--accent)';
        setTimeout(() => {
          button.textContent = 'COPY';
          button.style.color = '';
        }, 2000);
      });
    });
  });
});

// FAQ Accordion
document.addEventListener('DOMContentLoaded', () => {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const parent = question.parentElement;
      const isActive = parent.classList.contains('active');
      
      // Close all other accordions
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Toggle current
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });
});


// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
