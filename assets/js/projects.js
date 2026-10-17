document.addEventListener('DOMContentLoaded', () => {
    
    // State
    let currentFilter = 'All';
    let searchQuery = '';
    let currentSwiper = null;
    
    // DOM Elements
    const listingView = document.getElementById('projectsListingView');
    const detailsView = document.getElementById('projectDetailsView');
    const projectGrid = document.getElementById('projectGrid');
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const searchInput = document.getElementById('projectSearch');
    const clearBtn = document.getElementById('btnClearFilters');
    const resultsCount = document.getElementById('projectResultsCount');
    
    // Init
    function init() {
        applyFilters();
        handleRouting();
    }
    
    // Routing
    function handleRouting() {
        const hash = window.location.hash.substring(1);
        if(hash && hash !== 'projects-filters-section') {
            const project = projectsData.find(p => p.id === hash);
            if(project) {
                renderProjectDetails(project);
                return;
            }
        }
        showListing();
    }
    
    window.addEventListener('hashchange', handleRouting);
    
    document.querySelectorAll('.btn-back-projects').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if(currentSwiper && currentSwiper.autoplay && currentSwiper.autoplay.running) {
                currentSwiper.autoplay.stop();
            }
            window.location.hash = '';
        });
    });
    
    // Render Functions
    function showListing() {
        if (currentSwiper?.autoplay) currentSwiper.autoplay.stop();
        if(detailsView) detailsView.classList.add('d-none');
        if(listingView) listingView.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
    
    function renderProjectDetails(project) {
        if(listingView) listingView.classList.add('d-none');
        if(detailsView) detailsView.classList.remove('d-none');
        window.scrollTo(0, 0);
        
        document.getElementById('detailBadge').textContent = project.category;
        document.getElementById('detailTitle').textContent = project.title;
        document.getElementById('detailDesc').textContent = project.description;
        document.getElementById('detailOutcome').textContent = project.outcome;
        
        document.getElementById('detailScope').innerHTML = project.scope.map(s => `<li class="mb-2 d-flex"><i class="bi bi-check text-gold me-2 mt-1"></i> <span>${s}</span></li>`).join('');
        document.getElementById('detailProcess').innerHTML = project.process.map((p, i) => `<li class="mb-3 d-flex align-items-start"><span class="badge bg-gold text-navy rounded-circle me-3 p-2" style="min-width: 28px; text-align: center;">${i+1}</span> <span>${p}</span></li>`).join('');
        
        const colorsContainer = document.getElementById('detailColorsContainer');
        if(project.colors && project.colors.length > 0) {
            colorsContainer.innerHTML = project.colors.map(c => `
                <div class="d-flex align-items-center mb-3">
                    <div class="rounded-circle border shadow-sm me-3" style="width: 40px; height: 40px; background-color: ${c.hex};"></div>
                    <div>
                        <div class="fw-bold text-navy">${c.name}</div>
                        <div class="small text-slate text-uppercase">${c.hex}</div>
                    </div>
                </div>
            `).join('');
        } else {
            colorsContainer.innerHTML = '<p class="text-slate small">Custom mixed palette.</p>';
        }
        
        // Carousel: exactly 2 unique images per project
        const galleryImages = (Array.isArray(project.gallery) && project.gallery.length === 2)
            ? project.gallery
            : [
                { src: project.primaryImage, alt: project.title },
                ...((project.gallery || []).filter(g => g.src !== project.primaryImage))
              ].slice(0, 2);

        const swiperWrapper = document.getElementById('detailCarouselWrapper');
        swiperWrapper.innerHTML = galleryImages.map(img => `
            <div class="swiper-slide h-100 bg-dark">
                <img src="${img.src}" alt="${img.alt}" class="w-100 h-100" style="object-fit:cover; object-position:center;">
            </div>
        `).join('');
        
        if(currentSwiper) {
            currentSwiper.destroy(true, true);
            currentSwiper = null;
            window.currentSwiper = null;
        }
        
        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        currentSwiper = new Swiper('.projectDetailsSwiper', {
            loop: galleryImages.length > 1,
            effect: 'fade',
            fadeEffect: { crossFade: true },
            autoplay: (galleryImages.length > 1 && !prefersReducedMotion) ? {
                delay: 1000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
                waitForTransition: false
            } : false,
            speed: 280, // 280ms smooth crossfade
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            a11y: { enabled: true },
            keyboard: { enabled: true }
        });
        window.currentSwiper = currentSwiper;

        // Exactly 2 project thumbnails
        const thumbsContainer = document.getElementById('projectCarouselThumbs');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = galleryImages.map((img, i) => `
                <button type="button" class="project-gallery-thumb${i === 0 ? ' is-active' : ''}" data-thumb-index="${i}" aria-label="Show photograph ${i + 1} of ${galleryImages.length}" aria-selected="${i === 0}">
                    <img src="${img.src}" alt="${img.alt}" loading="lazy">
                </button>
            `).join('');
            thumbsContainer.hidden = galleryImages.length < 2;

            thumbsContainer.onclick = (e) => {
                const btn = e.target.closest('[data-thumb-index]');
                if (btn && currentSwiper) {
                    const idx = Number(btn.dataset.thumbIndex);
                    currentSwiper.slideToLoop(idx);
                }
            };

            currentSwiper.on('slideChange', () => {
                const realIndex = currentSwiper.realIndex;
                thumbsContainer.querySelectorAll('.project-gallery-thumb').forEach((thumb, i) => {
                    const isCur = i === realIndex;
                    thumb.classList.toggle('is-active', isCur);
                    thumb.setAttribute('aria-selected', String(isCur));
                });
            });
        }
        
        // Ensure Back Button works
        const backBtns = document.querySelectorAll('.btnBackToProjects');
        backBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                window.location.hash = ''; // Clear hash to trigger routing back to listing view
            };
        });
        
        // Related
        renderRelatedProjects(project);
        
        // CTA
        document.getElementById('detailCta').href = `estimate.html?service=${project.serviceId}`;
    }
    
    function applyFilters() {
        let filtered = projectsData;
        
        if(currentFilter !== 'All') {
            filtered = filtered.filter(p => p.filterClass === currentFilter);
        }
        
        if(searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
            if(clearBtn) clearBtn.classList.remove('d-none');
        } else {
            if(clearBtn) clearBtn.classList.add('d-none');
        }
        
        renderGrid(filtered);
    }
    
    function renderGrid(projects) {
        if(!projectGrid) return;
        projectGrid.innerHTML = '';
        
        if(resultsCount) {
            resultsCount.textContent = `Showing ${projects.length} project${projects.length !== 1 ? 's' : ''}`;
        }
        
        if(projects.length === 0) {
            projectGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search display-4 text-muted mb-3 d-block"></i>
                    <h4 class="text-navy fw-bold">No projects found</h4>
                    <p class="text-slate">Try adjusting your filters or search query.</p>
                </div>`;
            return;
        }
        
        projects.forEach(project => {
            const card = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden group hover-lift transition-fast">
                        <a href="#${project.id}" class="position-relative d-block overflow-hidden" style="aspect-ratio: 16/10;">
                            <img src="${project.primaryImage}" class="w-100 h-100 object-fit-cover transition-fast group-hover:scale-105" loading="lazy" alt="${project.title}">
                            <div class="position-absolute top-0 start-0 w-100 h-100 bg-navy opacity-0 group-hover:opacity-20 transition-fast"></div>
                        </a>
                        <div class="card-body p-4 d-flex flex-column">
                            <span class="badge bg-light text-navy fw-bold border align-self-start mb-3">${project.category}</span>
                            <h5 class="fw-bold text-navy mb-2"><a href="#${project.id}" class="text-navy text-decoration-none hover-gold-text">${project.title}</a></h5>
                            <p class="text-slate small mb-4 flex-grow-1">${project.description}</p>
                            <div class="d-flex justify-content-between align-items-center pt-3 border-top border-soft mt-auto">
                                <a href="#${project.id}" class="btn home-action">View Details <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            projectGrid.innerHTML += card;
        });
    }
    
    function renderRelatedProjects(currentProject) {
        const grid = document.getElementById('relatedProjectsGrid');
        if(!grid) return;
        const related = projectsData.filter(p => p.id !== currentProject.id).slice(0, 3);
        grid.innerHTML = related.map(p => `
            <div class="col-md-4">
                <div class="card h-100 border border-soft shadow-sm rounded-4 overflow-hidden group">
                    <a href="#${p.id}" class="position-relative d-block overflow-hidden flex-shrink-0" style="aspect-ratio: 16/10;">
                        <img src="${p.primaryImage}" class="w-100 h-100 object-fit-cover transition-fast group-hover:scale-105" loading="lazy" alt="${p.title}">
                    </a>
                    <div class="card-body p-4 text-center d-flex flex-column">
                        <span class="text-gold fw-bold text-uppercase fs-8 mb-2 d-block">${p.category}</span>
                        <h6 class="fw-bold text-navy mb-3"><a href="#${p.id}" class="text-navy text-decoration-none">${p.title}</a></h6>
                        <a href="#${p.id}" class="btn home-action mt-auto align-self-center">View Details <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Events
    if(filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => {
                    b.classList.remove('btn-navy', 'text-white');
                    b.classList.add('btn-outline-navy');
                });
                e.target.classList.remove('btn-outline-navy');
                e.target.classList.add('btn-navy', 'text-white');
                currentFilter = e.target.getAttribute('data-filter');
                applyFilters();
            });
        });
    }
    
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }
    
    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            if(searchInput) searchInput.value = '';
            searchQuery = '';
            applyFilters();
        });
    }
    
    init();
});
