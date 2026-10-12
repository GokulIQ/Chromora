document.addEventListener('DOMContentLoaded', () => {
    
    // State
    let currentFilter = 'All';
    let searchQuery = '';
    let savedArticles = JSON.parse(localStorage.getItem('chromora_saved_articles') || '[]');
    
    // DOM Elements
    const blogListingView = document.getElementById('blogListingView');
    const articleView = document.getElementById('articleView');
    const blogGrid = document.getElementById('blogGrid');
    const popularGrid = document.getElementById('popularGuidesGrid');
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const searchInput = document.getElementById('blogSearch');
    const clearBtn = document.getElementById('btnClearFilters');
    const resultsCount = document.getElementById('blogResultsCount');
    
    // Init
    function init() {
        renderPopularGuides();
        applyFilters();
        handleRouting();
    }
    
    // Routing
    function handleRouting() {
        const hash = window.location.hash.substring(1);
        if(hash && hash !== 'blog-filters-section') {
            const article = blogPosts.find(p => p.slug === hash || p.id === hash);
            if(article) {
                renderArticle(article);
                return;
            }
        }
        showListing();
    }
    
    window.addEventListener('hashchange', handleRouting);
    
    document.querySelectorAll('.btn-back-blog').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '';
        });
    });
    
    // Render Functions
    function showListing() {
        if(articleView) articleView.classList.add('d-none');
        if(blogListingView) blogListingView.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
    
    function renderArticle(article) {
        if(blogListingView) blogListingView.classList.add('d-none');
        if(articleView) articleView.classList.remove('d-none');
        window.scrollTo(0, 0);
        
        document.getElementById('articleBadge').textContent = article.category;
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleExcerpt').textContent = article.excerpt;
        document.getElementById('articleAuthor').innerHTML = `<i class="bi bi-person me-1"></i> ${article.author}`;
        document.getElementById('articleDate').innerHTML = `<i class="bi bi-calendar3 me-1"></i> ${article.date}`;
        document.getElementById('articleReadTime').innerHTML = `<i class="bi bi-clock me-1"></i> ${article.readingTime}`;
        document.getElementById('articleImage').src = article.image;
        document.getElementById('articleContent').innerHTML = article.content;
        
        // TOC
        const headings = document.getElementById('articleContent').querySelectorAll('h2');
        const tocList = Array.from(headings).map((h, i) => {
            const id = `heading-${i}`;
            h.id = id;
            return `<li><a href="#${id}" class="text-slate text-decoration-none hover-gold-text toc-link">${h.textContent}</a></li>`;
        }).join('');
        
        const desktopToc = document.getElementById('desktopToc');
        const mobileToc = document.getElementById('mobileToc');
        if(desktopToc) desktopToc.innerHTML = tocList;
        if(mobileToc) mobileToc.innerHTML = tocList;
        
        // Smooth scroll for TOC
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const el = document.getElementById(targetId);
                if(el) {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            });
        });
        
        // Bookmark btn
        const bmBtn = document.getElementById('btnBookmarkDetail');
        if(bmBtn) {
            const isSaved = savedArticles.includes(article.id);
            bmBtn.innerHTML = isSaved ? '<i class="bi bi-bookmark-fill text-gold"></i>' : '<i class="bi bi-bookmark"></i>';
            bmBtn.setAttribute('aria-pressed', String(isSaved));
            bmBtn.setAttribute('aria-label', isSaved ? 'Remove saved article' : 'Save article');
            bmBtn.onclick = () => toggleBookmark(article.id, bmBtn);
        }
        
        renderRelatedArticles(article);
    }
    
    function applyFilters() {
        let filtered = blogPosts;
        
        if(currentFilter !== 'All') {
            filtered = filtered.filter(p => p.category === currentFilter);
        }
        
        if(searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.excerpt.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
            if(clearBtn) clearBtn.classList.remove('d-none');
        } else {
            if(clearBtn) clearBtn.classList.add('d-none');
        }
        
        renderGrid(filtered);
    }
    
    function renderGrid(posts) {
        if(!blogGrid) return;
        blogGrid.innerHTML = '';
        
        if(resultsCount) {
            resultsCount.textContent = `Showing ${posts.length} article${posts.length !== 1 ? 's' : ''}`;
        }
        
        if(posts.length === 0) {
            blogGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search display-4 text-muted mb-3 d-block"></i>
                    <h4 class="text-navy fw-bold">No articles found</h4>
                    <p class="text-slate">Try adjusting your filters or search query.</p>
                </div>`;
            return;
        }
        
        posts.forEach(post => {
            const isSaved = savedArticles.includes(post.id);
            const icon = isSaved ? 'bi-bookmark-fill text-gold' : 'bi-bookmark';
            
            const card = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden group hover-lift transition-fast">
                        <a href="#${post.slug}" class="position-relative d-block overflow-hidden" style="aspect-ratio: 16/10;">
                            <img src="${post.image}" class="w-100 h-100 object-fit-cover transition-fast group-hover:scale-105" loading="lazy" alt="${post.title}">
                            <div class="position-absolute top-0 start-0 w-100 h-100 bg-navy opacity-0 group-hover:opacity-20 transition-fast"></div>
                        </a>
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-navy fw-bold border">${post.category}</span>
                                <button class="btn btn-link p-0 text-slate hover-gold-text btn-bookmark" data-id="${post.id}"><i class="bi ${icon} fs-5"></i></button>
                            </div>
                            <h5 class="fw-bold text-navy mb-2"><a href="#${post.slug}" class="text-navy text-decoration-none hover-gold-text">${post.title}</a></h5>
                            <p class="text-slate small mb-4 flex-grow-1">${post.excerpt}</p>
                            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center pt-3 border-top border-soft mt-auto">
                                <span class="text-slate small"><i class="bi bi-clock me-1"></i> ${post.readingTime}</span>
                                <a href="#${post.slug}" class="btn related-article-link rounded-pill" aria-label="Read article: ${post.title}">Read Article <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            blogGrid.innerHTML += card;
        });
        
        // Attach bookmark events
        document.querySelectorAll('.btn-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleBookmark(btn.getAttribute('data-id'), btn);
            });
        });
    }
    
    function toggleBookmark(id, btnElement) {
        const index = savedArticles.indexOf(id);
        if(index > -1) {
            savedArticles.splice(index, 1);
            if(btnElement) btnElement.innerHTML = '<i class="bi bi-bookmark fs-5"></i>';
        } else {
            savedArticles.push(id);
            if(btnElement) btnElement.innerHTML = '<i class="bi bi-bookmark-fill text-gold fs-5"></i>';
        }
        if (btnElement) {
            const isSaved = savedArticles.includes(id);
            btnElement.setAttribute('aria-pressed', String(isSaved));
            btnElement.setAttribute('aria-label', isSaved ? 'Remove saved article' : 'Save article');
        }
        localStorage.setItem('chromora_saved_articles', JSON.stringify(savedArticles));
    }
    
    function renderPopularGuides() {
        if(!popularGrid) return;
        const guides = blogPosts.slice(0, 3);
        popularGrid.innerHTML = guides.map(post => `
            <div class="col-md-4 d-flex">
                <a href="#${post.slug}" class="popular-guide-link text-decoration-none d-flex w-100 rounded-4">
                    <div class="popular-guide-card p-4 rounded-4 w-100 d-flex flex-column">
                        <span class="popular-guide-category fw-bold text-uppercase fs-8 mb-2 d-block">${post.category}</span>
                        <h4 class="text-white fw-bold mb-3">${post.title}</h4>
                        <span class="text-white small fw-bold text-uppercase tracking-wide mt-auto">Read Guide <i class="bi bi-arrow-right ms-1"></i></span>
                    </div>
                </a>
            </div>
        `).join('');
    }
    
    function renderRelatedArticles(currentArticle) {
        const grid = document.getElementById('relatedArticlesGrid');
        if(!grid) return;
        const related = blogPosts.filter(p => p.id !== currentArticle.id).slice(0, 3);
        grid.innerHTML = related.map(post => `
            <div class="col-md-4">
                <div class="card h-100 border border-soft shadow-sm rounded-4 overflow-hidden group">
                    <a href="#${post.slug}" class="position-relative d-block overflow-hidden flex-shrink-0" style="aspect-ratio: 16/10;">
                        <img src="${post.image}" class="w-100 h-100 object-fit-cover transition-fast group-hover:scale-105" loading="lazy" alt="${post.title}">
                    </a>
                    <div class="card-body p-4 text-center d-flex flex-column">
                        <span class="text-gold fw-bold text-uppercase fs-8 mb-2 d-block">${post.category}</span>
                        <h6 class="fw-bold text-navy mb-3"><a href="#${post.slug}" class="text-navy text-decoration-none">${post.title}</a></h6>
                        <a href="#${post.slug}" class="btn related-article-link rounded-pill mt-auto align-self-center">Read Article <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
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
