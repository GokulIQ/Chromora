/* theme.js */
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-home, [id^="theme-toggle"]');
  const rootElement = document.documentElement;
  
  // RTL logic preserved...
  const rtlToggleBtn = document.getElementById('rtl-toggle');
  const bootstrapStyles = document.querySelector('link[href*="/bootstrap@"]');

  // Keep the same preference buttons visible beside the mobile menu toggle.
  const headerActions = document.querySelector('.redesign-header .navbar-actions');
  const menuToggle = document.querySelector('.redesign-header .navbar-toggler');
  if (headerActions && menuToggle) {
    const preferenceButtons = [...headerActions.querySelectorAll('.navbar-icon-button')];
    const mobilePreferences = document.createElement('div');
    mobilePreferences.className = 'navbar-mobile-preferences';
    menuToggle.before(mobilePreferences);
    const mobileHeader = window.matchMedia('(max-width: 1399.98px)');
    const placePreferences = () => {
      if (mobileHeader.matches) {
        mobilePreferences.append(...preferenceButtons);
      } else {
        headerActions.prepend(...preferenceButtons);
      }
    };
    placePreferences();
    mobileHeader.addEventListener('change', placePreferences);
  }

  function applyDirection(direction) {
    const isRtl = direction === 'rtl';
    rootElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    if (bootstrapStyles) {
      const nextHref = bootstrapStyles.href.replace(/bootstrap(?:\.rtl)?\.min\.css/, isRtl ? 'bootstrap.rtl.min.css' : 'bootstrap.min.css');
      if (bootstrapStyles.href !== nextHref) bootstrapStyles.href = nextHref;
    }
    if (rtlToggleBtn) {
      const label = isRtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout';
      rtlToggleBtn.setAttribute('aria-label', label);
      rtlToggleBtn.setAttribute('title', label);
      rtlToggleBtn.setAttribute('aria-pressed', String(isRtl));
      rtlToggleBtn.textContent = 'RTL';
    }
  }

  let savedDirection;
  try { savedDirection = localStorage.getItem('direction'); } catch { /* Storage may be unavailable. */ }
  applyDirection(savedDirection || rootElement.getAttribute('dir'));
  if (rtlToggleBtn) {
    rtlToggleBtn.addEventListener('click', () => {
      const direction = rootElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(direction);
      try { localStorage.setItem('direction', direction); } catch { /* The toggle still works without persistence. */ }
    });
  }
  
  // Theme logic
  // Read theme from root element (which was set by FOIT script in head)
  let currentTheme = rootElement.getAttribute('data-theme') || 'light';
  
  updateIcon(currentTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      let theme = rootElement.getAttribute('data-theme');
      if (theme === 'dark') {
        rootElement.setAttribute('data-theme', 'light');
        rootElement.setAttribute('data-bs-theme', 'light');
        try { localStorage.setItem('chromora-theme', 'light'); } catch(e){}
        updateIcon('light');
      } else {
        rootElement.setAttribute('data-theme', 'dark');
        rootElement.setAttribute('data-bs-theme', 'dark');
        try { localStorage.setItem('chromora-theme', 'dark'); } catch(e){}
        updateIcon('dark');
      }
    });
  });

  function updateIcon(theme) {
    themeToggleBtns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = '<i class="bi bi-sun-fill text-gold"></i>';
      } else {
        btn.innerHTML = '<i class="bi bi-moon-fill text-navy"></i>';
      }
    });
  }
});
