document.addEventListener('DOMContentLoaded', () => {
    const transformation = document.querySelector('.painting-transformation');
    if (!transformation) return;

    const beforeImage = transformation.querySelector('.before-image');
    const afterImage = transformation.querySelector('.after-image');
    const btnBefore = document.getElementById('btn-show-before');
    const btnAfter = document.getElementById('btn-show-after');
    
    let intervalId = null;
    let showAfter = false;
    
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function startAutoSwitch() {
        if (prefersReducedMotion.matches) return;
        
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            showAfter = !showAfter;
            transformation.classList.toggle('show-after', showAfter);
        }, 2000);
    }
    
    function stopAutoSwitch() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
    
    // Wait until both images are fully loaded
    let loadedCount = 0;
    function checkLoad() {
        loadedCount++;
        if (loadedCount >= 2) {
            startAutoSwitch();
        }
    }
    
    if (beforeImage.complete) {
        checkLoad();
    } else {
        beforeImage.addEventListener('load', checkLoad);
    }
    
    if (afterImage.complete) {
        checkLoad();
    } else {
        afterImage.addEventListener('load', checkLoad);
    }

    // Intersection Observer to pause when offscreen
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (loadedCount >= 2) startAutoSwitch();
                } else {
                    stopAutoSwitch();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(transformation);
    }
    
    // Page Visibility API to pause when tab is inactive
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSwitch();
        } else {
            if (loadedCount >= 2) startAutoSwitch();
        }
    });
    
    // Handle manual controls for reduced motion
    if (btnBefore && btnAfter) {
        btnBefore.addEventListener('click', () => {
            stopAutoSwitch();
            transformation.classList.remove('show-after');
        });
        
        btnAfter.addEventListener('click', () => {
            stopAutoSwitch();
            transformation.classList.add('show-after');
        });
    }
    
    // Listen for changes to reduced motion preference
    prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
            stopAutoSwitch();
        } else {
            startAutoSwitch();
        }
    });
});
