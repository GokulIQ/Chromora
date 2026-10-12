/* main.js */
document.addEventListener('DOMContentLoaded', () => {
  // Dynamic Header Height Tracking
  const redesignHeader = document.querySelector('.redesign-header, .site-header');
  if (redesignHeader) {
    const updateHeaderHeight = () => {
      const h = redesignHeader.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', `${Math.round(h)}px`);
    };
    updateHeaderHeight();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateHeaderHeight).observe(redesignHeader);
    } else {
      window.addEventListener('resize', updateHeaderHeight);
    }
  }

  // Reserve the fixed navigation's actual height above the pricing introduction.
  const pricingHero = document.querySelector('.pricing-hero');
  const pricingHeader = document.querySelector('.redesign-header.fixed-top');
  if (pricingHero && pricingHeader) {
    const updatePricingOffset = () => {
      pricingHero.style.setProperty('--pricing-header-height', `${pricingHeader.getBoundingClientRect().height}px`);
    };
    updatePricingOffset();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updatePricingOffset).observe(pricingHeader);
    } else {
      window.addEventListener('resize', updatePricingOffset);
    }
  }

  // Mobile Navigation Drawer UX & Accessibility
  const mainNav = document.getElementById('mainNav');
  const navbarToggler = document.querySelector('.navbar-toggler');
  if (mainNav && navbarToggler) {
    // Lock body scroll when mobile navigation is open
    mainNav.addEventListener('show.bs.collapse', () => {
      if (window.innerWidth < 1400) {
        document.body.style.overflow = 'hidden';
      }
    });

    mainNav.addEventListener('hidden.bs.collapse', () => {
      document.body.style.overflow = '';
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          const bsCollapse = bootstrap.Collapse.getInstance(mainNav) || new bootstrap.Collapse(mainNav, { toggle: false });
          bsCollapse.hide();
        } else {
          mainNav.classList.remove('show');
          document.body.style.overflow = '';
        }
        navbarToggler.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mainNav.classList.contains('show') &&
        !mainNav.contains(e.target) &&
        !navbarToggler.contains(e.target)
      ) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          const bsCollapse = bootstrap.Collapse.getInstance(mainNav) || new bootstrap.Collapse(mainNav, { toggle: false });
          bsCollapse.hide();
        } else {
          mainNav.classList.remove('show');
          document.body.style.overflow = '';
        }
      }
    });

    // Auto-close on nav link click (for in-page anchors on mobile)
    mainNav.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1400 && mainNav.classList.contains('show')) {
          if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getInstance(mainNav) || new bootstrap.Collapse(mainNav, { toggle: false });
            bsCollapse.hide();
          } else {
            mainNav.classList.remove('show');
            document.body.style.overflow = '';
          }
        }
      });
    });
  }

  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    try {
      AOS.init({
        duration: 800,
        once: true,
        offset: 50,
      });
      document.documentElement.classList.add('aos-ready');
    } catch (error) {
      // Leave content visible if the optional animation library cannot start.
      console.warn('Scroll animations could not initialize.', error);
    }
  }

  // Sticky Header
  const header = document.querySelector('.site-header, .redesign-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('shadow-sm');
      } else {
        header.classList.remove('shadow-sm');
      }
    }, { passive: true });
  }

  // Portfolio Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterBtns.length > 0 && portfolioItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class
        filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
        filterBtns.forEach(b => b.classList.add('btn-outline'));
        
        // Add active class to clicked
        btn.classList.add('active', 'btn-primary');
        btn.classList.remove('btn-outline');

        const filterValue = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // Testimonial Swiper
  if (typeof Swiper !== 'undefined' && document.querySelector('.testimonial-swiper')) {
    new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 }
      }
    });
  }

  // Active Navigation Logic
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
    
    // Remove active from child dropdown items as well
    if(link.nextElementSibling && link.nextElementSibling.classList.contains('dropdown-menu')) {
        const items = link.nextElementSibling.querySelectorAll('.dropdown-item');
        items.forEach(i => {
          i.classList.remove('active');
          i.removeAttribute('aria-current');
        });
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    if (href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else if (link.classList.contains('dropdown-toggle')) {
      const dropdownMenu = link.nextElementSibling;
      if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
          if (item.getAttribute('href') === currentPath) {
            link.classList.add('active');
            item.classList.add('active'); // Optional: highlight child item
            item.setAttribute('aria-current', 'page');
          }
        });
      }
    }
  });

});

document.addEventListener('DOMContentLoaded', function() {
    // Before & After Slider Logic
    const slider = document.getElementById('ba-slider');
    const beforeImage = document.getElementById('ba-image-before');
    const divider = document.getElementById('ba-divider');
    const selectors = document.querySelectorAll('.ba-selector');
    const afterImage = document.getElementById('ba-image-after');

    if (slider && beforeImage && divider) {
        // Initial setup
        slider.value = 50;
        updateSlider(50);

        // Update on input
        slider.addEventListener('input', function(e) {
            updateSlider(e.target.value);
        });

        function updateSlider(val) {
            beforeImage.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
            divider.style.left = `${val}%`;
        }

        // Transformation Data (Conceptual paired images)
        const transformations = {
            exterior: {
                src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                filterClass: 'concept-filter-exterior'
            },
            interior: {
                src: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                filterClass: 'concept-filter-interior'
            },
            cabinets: {
                src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                filterClass: 'concept-filter-cabinets'
            }
        };

        // Handle category selection
        selectors.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state styling
                selectors.forEach(b => {
                    b.classList.remove('btn-gold');
                    b.style.backgroundColor = 'transparent';
                    b.style.color = '#fff';
                    b.style.borderColor = 'rgba(255,255,255,0.3)';
                });
                
                this.classList.add('btn-gold');
                this.style.backgroundColor = 'var(--c-accent)';
                this.style.color = '#fff';
                this.style.borderColor = 'var(--c-accent)';

                const cat = this.getAttribute('data-cat');
                const data = transformations[cat];

                if (data) {
                    // Update images
                    afterImage.src = data.src;
                    beforeImage.src = data.src;
                    
                    // Update filter class for Before image
                    beforeImage.className = `position-absolute top-0 start-0 w-100 h-100 ${data.filterClass}`;
                    beforeImage.style.objectFit = 'cover';
                    beforeImage.style.objectPosition = 'center';
                    beforeImage.style.pointerEvents = 'none';

                    // Reset slider
                    slider.value = 50;
                    updateSlider(50);
                }
            });
        });
    }
});
