document.addEventListener('DOMContentLoaded', () => {

    // 1. Room Inspiration Selector (Section 03)
    const roomSelectors = document.querySelectorAll('.room-selector-btn');
    const mainImg = document.getElementById('roomGalleryMainImg');
    const title = document.getElementById('roomGalleryTitle');
    const desc = document.getElementById('roomGalleryDesc');
    const colorsContainer = document.getElementById('roomGalleryColors');
    const link = document.getElementById('roomGalleryLink');

    const roomData = {
        'living': {
            img: 'assets/images/services/interior-painting.webp',
            title: 'The Living Room',
            desc: 'Neutral tones paired with deep architectural accents create a grounded, welcoming gathering space.',
            colors: ['#FAF8F5', '#142E4A', '#B89562'],
            link: 'services.html#interior-painting',
            linkText: 'Explore Interior Painting'
        },
        'bedroom': {
            img: 'assets/images/home-02/room-bedroom.webp',
            title: 'The Bedroom',
            desc: 'Soft, muted tones and organic shades promote restful sleep and a calm, sanctuary-like atmosphere.',
            colors: ['#E2C7B8', '#FAF8F5', '#8A5A44'],
            link: 'services.html#interior-painting',
            linkText: 'Explore Bedroom Painting'
        },
        'kitchen': {
            img: 'assets/images/home-02/room-kitchen.webp',
            title: 'The Kitchen',
            desc: 'Bright, energetic spaces balanced with elegant, durable cabinet enamels and crisp trim work.',
            colors: ['#FFFFFF', '#7B8B6F', '#19324D'],
            link: 'services.html#cabinet-painting',
            linkText: 'Explore Cabinet Painting'
        },
        'dining': {
            img: 'assets/images/home-02/room-dining.webp',
            title: 'The Dining Room',
            desc: 'Dramatic, saturated feature walls create sophisticated, memorable spaces for elegant entertaining.',
            colors: ['#142E4A', '#FFFFFF', '#B89562'],
            link: 'services.html#interior-painting',
            linkText: 'Explore Accent Walls'
        },
        'office': {
            img: 'assets/images/home-02/room-office.webp',
            title: 'The Home Office',
            desc: 'Focused, sophisticated tones that reduce glare and promote calm productivity throughout the workday.',
            colors: ['#B2C2CF', '#FAF8F5', '#19324D'],
            link: 'services.html#interior-painting',
            linkText: 'Explore Interior Painting'
        }
    };

    if (roomSelectors.length > 0) {
        roomSelectors.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                roomSelectors.forEach(b => {
                    b.classList.remove('active');
                    b.querySelector('.rounded-4').classList.remove('bg-light');
                });
                
                // Add active class
                btn.classList.add('active');
                btn.querySelector('.rounded-4').classList.add('bg-light');
                
                // Update content
                const room = roomData[btn.getAttribute('data-room')];
                if (room) {
                    mainImg.style.opacity = '0';
                    setTimeout(() => {
                        mainImg.src = room.img;
                        mainImg.style.opacity = '1';
                    }, 200);
                    
                    title.textContent = room.title;
                    desc.textContent = room.desc;
                    
                    colorsContainer.innerHTML = room.colors.map(c => `<div class="rounded-circle shadow-sm" style="width:24px; height:24px; background:${c};"></div>`).join('');
                    
                    link.href = room.link;
                    link.textContent = room.linkText;
                }
            });
        });
    }


    // 2. Interactive Color Mood Board (Section 10)
    const moodSwatches = document.querySelectorAll('.moodboard-selector .btn-color-swatch');
    const btnCopy = document.getElementById('btnCopyPalette');

    const boardState = {
        wall: { hex: '#FAF8F5', name: 'Warm Ivory' },
        accent: { hex: '#4A5D43', name: 'Deep Forest' },
        trim: { hex: '#FFFFFF', name: 'Brilliant White' }
    };

    if (moodSwatches.length > 0) {
        moodSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const targetArea = swatch.closest('.moodboard-selector').getAttribute('data-target');
                const hex = swatch.getAttribute('data-hex');
                const name = swatch.getAttribute('data-name');
                
                // Remove active from siblings
                const siblings = swatch.closest('.moodboard-selector').querySelectorAll('.btn-color-swatch');
                siblings.forEach(s => {
                    s.classList.remove('active');
                    s.style.boxShadow = 'none';
                    s.style.transform = 'scale(1)';
                });
                
                // Add active to current
                swatch.classList.add('active');
                swatch.style.boxShadow = '0 0 0 2px #fff, 0 0 0 4px #19324D';
                swatch.style.transform = 'scale(1.1)';
                
                // Update state
                boardState[targetArea] = { hex, name };
                
                // Update board UI
                const displayArea = document.getElementById(`mb-${targetArea}`);
                const displayLabel = document.getElementById(`mb-${targetArea}-label`);
                
                if(displayArea && displayLabel) {
                    displayArea.style.backgroundColor = hex;
                    displayLabel.textContent = name;
                }
                
                // Special border case for white
                if(targetArea === 'trim') {
                    if(hex === '#FFFFFF') {
                        displayArea.style.border = '1px solid #E8E9EB';
                    } else {
                        displayArea.style.border = 'none';
                    }
                }
            });
            
            // Set initial active state styles
            if(swatch.classList.contains('active')) {
                swatch.style.boxShadow = '0 0 0 2px #fff, 0 0 0 4px #19324D';
                swatch.style.transform = 'scale(1.1)';
            }
        });
        
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                const text = `Chromora Palette\nWall: ${boardState.wall.name} (${boardState.wall.hex})\nAccent: ${boardState.accent.name} (${boardState.accent.hex})\nTrim: ${boardState.trim.name} (${boardState.trim.hex})`;
                
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = btnCopy.innerHTML;
                    btnCopy.innerHTML = '<i class="bi bi-check2 me-2"></i> Copied to Clipboard';
                    btnCopy.classList.remove('btn-outline-navy');
                    btnCopy.classList.add('btn-navy', 'text-white');
                    
                    setTimeout(() => {
                        btnCopy.innerHTML = originalText;
                        btnCopy.classList.add('btn-outline-navy');
                        btnCopy.classList.remove('btn-navy', 'text-white');
                    }, 3000);
                });
            });
        }
    }

    // 3. Planning Checklist (Section 13)
    const checklistItems = document.querySelectorAll('.planning-checklist .custom-checkbox');
    const progressText = document.getElementById('checklist-progress');
    
    if(checklistItems.length > 0 && progressText) {
        
        // Load saved state
        const savedState = JSON.parse(localStorage.getItem('chromora_planning_checklist') || '{}');
        
        function updateProgress() {
            let checked = 0;
            const stateToSave = {};
            
            checklistItems.forEach((box, index) => {
                const label = box.closest('label');
                if(box.checked) {
                    checked++;
                    label.classList.remove('hover-bg-light');
                    label.classList.add('bg-light');
                    label.querySelector('span').classList.remove('text-navy');
                    label.querySelector('span').classList.add('text-muted', 'text-decoration-line-through');
                } else {
                    label.classList.add('hover-bg-light');
                    label.classList.remove('bg-light');
                    label.querySelector('span').classList.add('text-navy');
                    label.querySelector('span').classList.remove('text-muted', 'text-decoration-line-through');
                }
                stateToSave[index] = box.checked;
            });
            
            progressText.textContent = `${checked} of ${checklistItems.length} Completed`;
            localStorage.setItem('chromora_planning_checklist', JSON.stringify(stateToSave));
        }

        // Apply saved state
        checklistItems.forEach((box, index) => {
            if(savedState[index]) {
                box.checked = true;
            }
            box.addEventListener('change', updateProgress);
        });
        
        // Initial run
        updateProgress();
    }

});
