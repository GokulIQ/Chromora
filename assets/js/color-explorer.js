/* color-explorer.js */
document.addEventListener('DOMContentLoaded', () => {
  const swatches = document.querySelectorAll('.color-swatch');
  const previewArea = document.querySelector('.color-preview-wall');
  const colorNameEl = document.querySelector('.selected-color-name');
  
  if (swatches.length > 0 && previewArea) {
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        // Remove active from all
        swatches.forEach(s => s.classList.remove('active', 'border-dark', 'border-2'));
        
        // Add to selected
        swatch.classList.add('active', 'border-dark', 'border-2');
        
        const colorValue = swatch.getAttribute('data-color');
        const colorName = swatch.getAttribute('data-name');
        
        previewArea.style.backgroundColor = colorValue;
        if(colorNameEl) {
          colorNameEl.textContent = colorName;
        }
      });
    });
  }
});
