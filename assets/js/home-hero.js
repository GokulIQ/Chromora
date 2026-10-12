/* Keep Home 01's background photograph clear of the fixed navigation. */
(() => {
  const hero = document.querySelector('.premium-hero');
  const header = document.querySelector('.redesign-header');
  if (!hero || !header) return;

  const updateImageInset = () => {
    const heroTop = hero.getBoundingClientRect().top + window.scrollY;
    const inset = Math.max(0, header.getBoundingClientRect().height - heroTop);
    hero.style.setProperty('--hero-image-inset', `${inset}px`);
  };

  updateImageInset();
  const headerObserver = new ResizeObserver(updateImageInset);
  headerObserver.observe(header);
  window.addEventListener('resize', updateImageInset, { passive: true });
})();
