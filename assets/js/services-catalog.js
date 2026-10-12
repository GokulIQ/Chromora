/* The Services catalog uses the same data and detail dialog as Home 01. */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  let filter = 'all';
  let search = '';
  const filterBar = document.getElementById('catalog');
  const pillStrip = document.getElementById('categoryFilters');
  const pills = [...pillStrip.querySelectorAll('.filter-pill')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Three complementary choices per category keep the catalog easy to browse.
  // The full service data remains available to existing links and detail dialogs.
  const catalogServiceIds = new Set([
    'interior-painting', 'living-room-painting', 'bedroom-painting',
    'exterior-painting', 'stucco-masonry-painting', 'deck-fence-painting',
    'whole-house-painting', 'new-home-painting', 'move-in-move-out-painting',
    'cabinet-painting', 'bathroom-vanity-painting', 'woodwork-refinishing',
    'drywall-repair', 'wallpaper-removal', 'surface-preparation-priming',
    'accent-wall-painting', 'decorative-finishes', 'textured-wall-finishes',
    'interior-door-painting', 'trim-door-painting', 'front-door-painting'
  ]);
  const catalogServices = servicesData.filter(service => catalogServiceIds.has(service.id));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function render() {
    const query = search.trim().toLowerCase();
    const matches = catalogServices.filter(service => {
      const categoryMatch = filter === 'all' || service.filterClass === filter;
      if (!categoryMatch) return false;
      if (!query) return true;
      const searchCorpus = [
        service.title,
        service.description,
        service.category,
        ...(service.keywords || []),
        ...(service.highlights || []),
        ...(service.inclusions || [])
      ].join(' ').toLowerCase();
      return searchCorpus.includes(query);
    });

    grid.classList.toggle('d-none', !matches.length);
    const noResultsEl = document.getElementById('noResults');
    if (noResultsEl) noResultsEl.classList.toggle('d-none', !!matches.length);
    const countEl = document.getElementById('resultsCount');
    if (countEl) countEl.textContent = `Showing ${matches.length} result${matches.length === 1 ? '' : 's'}`;

    grid.innerHTML = matches.map(service => {
      const bullets = (service.highlights || service.inclusions || []).slice(0, 3);
      return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="service-card d-flex flex-column h-100 group" data-category="${escapeHtml(service.filterClass)}">
          <button type="button" class="service-details-trigger w-100" data-service-details="${escapeHtml(service.id)}" aria-label="View ${escapeHtml(service.title)} details" aria-haspopup="dialog">
            <div class="service-card__media"><img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.title)}" loading="lazy" style="--service-image-position:${escapeHtml(service.imagePosition || 'center')}"></div>
          </button>
          <div class="service-card-body flex-grow-1 d-flex flex-column">
            <div>
              <span class="service-badge">${escapeHtml(service.category)}</span>
              <h3 class="service-card-title">${escapeHtml(service.title)}</h3>
              <p class="service-card-desc">${escapeHtml(service.description)}</p>
              <ul class="service-card-highlights">
                ${bullets.map(h => `<li><i class="bi bi-check2-circle" aria-hidden="true"></i><span>${escapeHtml(h)}</span></li>`).join('')}
              </ul>
            </div>
            <div class="service-card-footer mt-auto pt-3 border-top border-soft">
              <a href="estimate.html?service=${encodeURIComponent(service.id)}" class="btn service-card-action service-card-action-primary">Get Estimate</a>
              <button type="button" data-service-details="${escapeHtml(service.id)}" aria-haspopup="dialog" class="btn service-card-action service-card-action-secondary">View Details <i class="bi bi-arrow-right" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function setFilter(value) {
    filter = value;
    pills.forEach(pill => {
      const isActive = pill.dataset.filter === value;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', String(isActive));
      if (isActive) {
        const pillRect = pill.getBoundingClientRect();
        const stripRect = pillStrip.getBoundingClientRect();
        pillStrip.scrollBy({
          left: (pillRect.left + pillRect.right - stripRect.left - stripRect.right) / 2,
          behavior: reducedMotion.matches ? 'instant' : 'smooth'
        });
      }
    });
    render();
    // Bring the new results below both sticky bars, even when filtering far down the catalog.
    requestAnimationFrame(() => {
      const results = grid.closest('section').querySelector('.container');
      const headerHeight = document.querySelector('.redesign-header')?.getBoundingClientRect().height || 0;
      window.scrollTo({
        top: Math.max(0, window.scrollY + results.getBoundingClientRect().top - headerHeight - filterBar.offsetHeight - 16),
        behavior: reducedMotion.matches ? 'instant' : 'smooth'
      });
    });
  }

  pills.forEach(pill => pill.addEventListener('click', () => setFilter(pill.dataset.filter)));
  const searchInput = document.getElementById('serviceSearch');
  if (searchInput) {
    searchInput.addEventListener('input', event => {
      search = event.target.value;
      render();
    });
  }

  window.resetFilters = () => {
    search = '';
    if (searchInput) searchInput.value = '';
    setFilter('all');
  };

  render();
});

