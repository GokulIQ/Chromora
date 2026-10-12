/* One data-driven service dialog, shared by Home 01 and Services. */
document.addEventListener('DOMContentLoaded', () => {
  const ALIASES = {
    'kitchen-cabinet-painting': 'cabinet-painting',
    'cabinet-refinishing': 'cabinet-painting',
    'baseboard-trim-painting': 'trim-door-painting',
    'trim-and-doors': 'trim-door-painting',
    'trim-doors': 'trim-door-painting',
    'decorative-wall-painting': 'decorative-finishes',
    'crown-molding-trim-painting': 'crown-molding-painting',
    'drywall-patching': 'drywall-repair',
    'wall-crack-repair': 'wall-crack-hole-repair',
    'crack-hole-repair': 'wall-crack-hole-repair',
    'move-in-painting': 'move-in-move-out-painting',
    'move-out-painting': 'move-in-move-out-painting',
    'two-tone-painting': 'two-tone-wall-painting',
    'textured-wall-painting': 'textured-wall-finishes'
  };

  const findService = rawId => {
    if (!rawId || typeof servicesData === 'undefined') return null;
    const id = String(rawId).toLowerCase().trim();
    return servicesData.find(s => s.id === id)
      || (ALIASES[id] && servicesData.find(s => s.id === ALIASES[id]))
      || servicesData.find(s => s.aliasIds && s.aliasIds.includes(id))
      || null;
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = values => (values || []).map(value => `<li>${escapeHtml(value)}</li>`).join('');

  const dialog = document.createElement('dialog');
  dialog.id = 'serviceDetailsModal';
  dialog.className = 'service-details-dialog';
  dialog.setAttribute('aria-labelledby', 'modalTitle');
  dialog.innerHTML = `
    <div class="service-details-toolbar">
      <span class="service-details-toolbar-title" id="modalToolbarTitle">Service Details</span>
      <button type="button" class="service-details-close" aria-label="Close service details" autofocus>✕</button>
    </div>
    <div class="service-details-top">
      <div class="service-gallery" role="region" aria-roledescription="carousel" aria-label="Service photographs">
        <div class="service-gallery-stage" id="modalCarouselWrapper"></div>
        <div class="service-gallery-controls" dir="ltr">
          <button type="button" data-slide="-1" aria-label="Previous photograph">←</button>
          <div class="service-gallery-dots"></div>
          <button type="button" data-slide="1" aria-label="Next photograph">→</button>
          <button type="button" class="service-gallery-pause" id="swiperPauseBtn">Pause</button>
        </div>
        <div class="service-gallery-thumbs" id="modalCarouselThumbs" role="tablist" aria-label="Photograph thumbnails"></div>
      </div>
      <div class="service-details-header">
        <span class="service-details-category" id="modalCategory"></span>
        <h2 class="service-details-title" id="modalTitle"></h2>
        <div class="service-details-overview" id="modalOverview"></div>
        <div class="service-details-highlights-box">
          <h4 class="service-details-subheading">Key Highlights</h4>
          <ul class="service-details-benefits" id="modalHighlights"></ul>
        </div>
        <a class="service-details-estimate" id="modalCta" href="estimate.html">Get Free Estimate →</a>
      </div>
    </div>
    <div class="service-details-sections">
      <section><h3>What's Included</h3><ul id="modalInclusions"></ul></section>
      <section><h3>Our Process</h3><ol id="modalProcess"></ol></section>
      <section><h3>Materials &amp; Finishes</h3><ul id="modalMaterials"></ul></section>
      <section><h3>Project Considerations</h3><ul id="modalConsiderations"></ul></section>
      <section class="service-details-wide" id="modalFaqsContainer"><h3>Frequently Asked Questions</h3><div id="modalFaqAccordion"></div></section>
      <section class="service-details-wide"><h3>Related Services</h3><div class="service-details-related" id="modalRelatedServices"></div></section>
    </div>`;
  document.body.appendChild(dialog);

  const get = id => dialog.querySelector(`#${id}`);
  const gallery = dialog.querySelector('.service-gallery');
  const stage = get('modalCarouselWrapper');
  const dots = dialog.querySelector('.service-gallery-dots');
  const thumbs = get('modalCarouselThumbs');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover)');
  let current = null, slides = [], slideIndex = 0, timer = null, playing = false;
  let hoverPaused = false, focusPaused = false, opener = null, savedOverflow = '';
  let savedScroll = { left: 0, top: 0 };

  function stopTimer() { clearInterval(timer); timer = null; }
  function updatePlayback() {
    stopTimer();
    const pauseBtn = get('swiperPauseBtn');
    if (pauseBtn) {
      pauseBtn.textContent = playing ? 'Pause' : 'Play';
      pauseBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    }
    if (dialog.open && playing && slides.length > 1 && !hoverPaused && !focusPaused && !document.hidden) {
      timer = setInterval(() => showSlide(slideIndex + 1), 1000);
    }
  }

  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((image, i) => {
      if (i === slideIndex && !image.hasAttribute('src')) image.src = image.dataset.src;
      image.classList.toggle('is-current', i === slideIndex);
      image.setAttribute('aria-hidden', String(i !== slideIndex));
      if (dots.children[i]) {
        dots.children[i].setAttribute('aria-current', String(i === slideIndex));
      }
    });
    const thumbButtons = thumbs.querySelectorAll('.service-gallery-thumb');
    thumbButtons.forEach((thumb, i) => {
      const isCur = i === slideIndex;
      thumb.classList.toggle('is-active', isCur);
      thumb.setAttribute('aria-selected', String(isCur));
      if (isCur) {
        // Scroll only the thumbnail strip, never the dialog or document.
        const itemRect = thumb.getBoundingClientRect();
        const stripRect = thumbs.getBoundingClientRect();
        if (itemRect.left < stripRect.left || itemRect.right > stripRect.right) {
          thumbs.scrollBy({
            left: (itemRect.left + itemRect.right - stripRect.left - stripRect.right) / 2,
            behavior: motion.matches ? 'instant' : 'smooth'
          });
        }
      }
    });
  }

  function render(service) {
    stopTimer();
    current = service;
    get('modalCategory').textContent = service.category;
    get('modalTitle').textContent = service.title;
    get('modalToolbarTitle').textContent = service.title;

    // Overview multi-paragraph rendering
    const overviewParas = Array.isArray(service.overview) && service.overview.length
      ? service.overview
      : (service.description ? [service.description] : []);
    get('modalOverview').innerHTML = overviewParas.map(p => `<p>${escapeHtml(p)}</p>`).join('');

    get('modalHighlights').innerHTML = list(service.highlights);
    get('modalInclusions').innerHTML = list(service.inclusions);
    get('modalProcess').innerHTML = list(service.process);
    get('modalMaterials').innerHTML = list(service.materials);
    get('modalConsiderations').innerHTML = list(service.considerations);
    get('modalCta').href = `estimate.html?service=${encodeURIComponent(service.id)}`;

    // Exactly two unique images per gallery
    const images = (Array.isArray(service.gallery) && service.gallery.length === 2)
      ? service.gallery
      : [
          { src: service.primaryImage || service.image, alt: service.title },
          ...((service.gallery || []).filter(g => g.src !== (service.primaryImage || service.image)))
        ].slice(0, 2);

    stage.innerHTML = images.map((img, i) => `
      <img data-src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || service.title)} — photograph ${i + 1} of ${images.length}" style="--service-image-position:${escapeHtml(i === 0 ? service.imagePosition || 'center' : 'center')}" decoding="async">
    `).join('');
    slides = [...stage.querySelectorAll('img')];

    dots.innerHTML = images.map((_, i) => `<button type="button" data-slide-index="${i}" aria-label="Show photograph ${i + 1} of ${images.length}"></button>`).join('');

    thumbs.innerHTML = images.map((img, i) => `
      <button type="button" class="service-gallery-thumb${i === 0 ? ' is-active' : ''}" data-thumb-index="${i}" aria-label="Jump to photograph ${i + 1} of ${images.length}" aria-selected="${i === 0}">
        <img src="${escapeHtml(img.src)}" alt="" loading="lazy">
      </button>
    `).join('');

    dialog.querySelector('.service-gallery-controls').hidden = images.length < 2;
    thumbs.hidden = images.length < 2;
    showSlide(0);
    playing = !motion.matches;

    // FAQs
    const hasFaqs = Array.isArray(service.faqs) && service.faqs.length > 0;
    get('modalFaqsContainer').hidden = !hasFaqs;
    get('modalFaqAccordion').innerHTML = (service.faqs || []).map(faq => `
      <details class="service-details-faq">
        <summary>${escapeHtml(faq.question)}</summary>
        <p>${escapeHtml(faq.answer)}</p>
      </details>
    `).join('');

    // Related Services (prioritizing relatedServiceIds)
    let related = [];
    if (Array.isArray(service.relatedServiceIds) && service.relatedServiceIds.length) {
      related = service.relatedServiceIds.map(findService).filter(Boolean);
    }
    if (related.length < 3) {
      const others = servicesData
        .filter(s => s.id !== service.id && !related.some(r => r.id === s.id))
        .sort((a, b) => Number(b.filterClass === service.filterClass) - Number(a.filterClass === service.filterClass));
      related = [...related, ...others];
    }
    related = related.slice(0, 3);
    get('modalRelatedServices').innerHTML = related.map(s => `
      <button type="button" class="service-related-item" data-service-details="${escapeHtml(s.id)}" aria-label="View ${escapeHtml(s.title)}">
        <img src="${escapeHtml(s.image)}" alt="" loading="lazy">
        <div class="service-related-info">
          <span class="service-related-badge">${escapeHtml(s.category)}</span>
          <span class="service-related-name">${escapeHtml(s.title)}</span>
        </div>
      </button>
    `).join('');

    dialog.scrollTop = 0;
  }

  function showService(id, trigger) {
    const service = findService(id);
    if (!service) return;
    const wasOpen = dialog.open;
    if (!wasOpen) {
      opener = trigger || document.activeElement;
      savedOverflow = document.body.style.overflow;
      savedScroll = { left: window.scrollX, top: window.scrollY };
    }
    if (!wasOpen || current?.id !== service.id) render(service);
    if (!wasOpen) {
      document.documentElement.classList.add('service-details-open');
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (trigger && dialog.contains(trigger)) {
      dialog.querySelector('.service-details-close').focus({ preventScroll: true });
    }
    hoverPaused = canHover.matches && gallery.matches(':hover');
    focusPaused = gallery.contains(document.activeElement);
    updatePlayback();
  }

  function syncHash() {
    const hash = location.hash.slice(1);
    if (!hash) {
      if (dialog.open) dialog.close();
      return;
    }
    const service = findService(hash);
    if (service) {
      if (!dialog.open || current?.id !== service.id) showService(service.id);
    } else if (dialog.open) {
      dialog.close();
    }
  }

  function openService(id, trigger) {
    const service = findService(id);
    if (!service) return;
    showService(service.id, trigger);
    if (location.hash.slice(1) !== service.id) location.hash = service.id;
  }

  function closeService() {
    dialog.close();
    if (findService(location.hash.slice(1))) {
      location.hash = '';
    }
  }

  dialog.addEventListener('close', () => {
    stopTimer();
    playing = false;
    document.documentElement.classList.remove('service-details-open');
    document.body.style.overflow = savedOverflow;
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    window.scrollTo({ ...savedScroll, behavior: 'instant' });
    requestAnimationFrame(() => {
      if (!dialog.open) window.scrollTo({ ...savedScroll, behavior: 'instant' });
    });
  });

  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeService();
  });

  dialog.querySelector('.service-details-close').addEventListener('click', closeService);

  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
      closeService();
    }
  });

  dialog.querySelectorAll('[data-slide]').forEach(button => {
    button.addEventListener('click', () => {
      showSlide(slideIndex + Number(button.dataset.slide));
      updatePlayback();
    });
  });

  dots.addEventListener('click', event => {
    const button = event.target.closest('[data-slide-index]');
    if (button) {
      showSlide(Number(button.dataset.slideIndex));
      updatePlayback();
    }
  });

  thumbs.addEventListener('click', event => {
    const button = event.target.closest('[data-thumb-index]');
    if (button) {
      showSlide(Number(button.dataset.thumbIndex));
      updatePlayback();
    }
  });

  get('swiperPauseBtn').addEventListener('click', () => {
    playing = !playing;
    if (playing) focusPaused = false;
    updatePlayback();
  });

  gallery.addEventListener('mouseenter', () => {
    hoverPaused = canHover.matches;
    updatePlayback();
  });

  gallery.addEventListener('mouseleave', () => {
    hoverPaused = false;
    updatePlayback();
  });

  gallery.addEventListener('focusin', event => {
    focusPaused = event.target.matches(':focus-visible');
    updatePlayback();
  });

  gallery.addEventListener('focusout', event => {
    focusPaused = gallery.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
    updatePlayback();
  });

  let swipeStart = null;
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    swipeStart = { x: event.clientX, y: event.clientY };
  });

  stage.addEventListener('pointercancel', () => { swipeStart = null; });

  stage.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5 || slides.length < 2) return;
    showSlide(slideIndex + (dx < 0 ? 1 : -1));
    updatePlayback();
  });

  motion.addEventListener('change', () => {
    if (motion.matches) playing = false;
    updatePlayback();
  });

  document.addEventListener('visibilitychange', updatePlayback);
  window.addEventListener('hashchange', syncHash);

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-service-details]');
    if (!trigger) return;
    event.preventDefault();
    openService(trigger.dataset.serviceDetails, trigger);
  });

  window.openServiceModal = id => openService(id, document.activeElement);

  document.querySelectorAll('[data-service-card]').forEach(card => {
    const service = findService(card.dataset.serviceCard);
    const image = card.querySelector('.premium-service-img');
    if (service && image) {
      image.src = service.image;
      image.style.setProperty('--service-image-position', service.imagePosition || 'center');
    }
  });

  syncHash();
});

