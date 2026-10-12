/* Chromora Interactive Color Studio */
document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id);
    const grid = byId('colorGrid');
    if (!grid) return;
    let activeCategory = 'All Colors';
    let searchQuery = '';
    let selectedColor = null;
    let compareA = null;
    let compareB = null;
    let compareMode = false;
    let favorites = [];
    try {
        const stored = JSON.parse(localStorage.getItem('chromora_favorites'));
        if (Array.isArray(stored)) favorites = [...new Set(stored.filter(id => colorData.some(c => c.id === id)))];
    } catch { /* The studio still works when storage is blocked or invalid. */ }

    const categories = ['All Colors', ...new Set(colorData.map(c => c.category))];
    const roomContainer = byId('visualizerSvgContainer');
    const roomSelect = byId('roomSelect');
    const searchInput = byId('colorSearch');

    function renderFilters() {
        byId('colorFilters').replaceChildren();
        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn rounded-pill px-4 py-2 me-2 mb-2 ${category === activeCategory ? 'btn-navy text-white' : 'btn-outline-navy'}`;
            button.textContent = category;
            button.setAttribute('aria-pressed', String(category === activeCategory));
            button.addEventListener('click', () => {
                activeCategory = category;
                renderFilters();
                renderGrid();
            });
            byId('colorFilters').appendChild(button);
        });
    }

    function renderGrid() {
        const filtered = colorData.filter(color =>
            (activeCategory === 'All Colors' || color.category === activeCategory) &&
            (!searchQuery || color.name.toLowerCase().includes(searchQuery) || color.hex.toLowerCase().includes(searchQuery))
        );
        byId('resultsCount').textContent = `${filtered.length} colors found`;
        grid.replaceChildren();
        if (!filtered.length) grid.innerHTML = '<div class="col-12 text-center text-slate py-5">No colors found. Try adjusting your filters.</div>';
        filtered.forEach(color => {
            const saved = favorites.includes(color.id);
            const column = document.createElement('div');
            column.className = 'col-6 col-md-4 col-lg-3 col-xl-2 mb-4';
            column.innerHTML = `
                <div class="color-card h-100 rounded-4 border overflow-hidden position-relative bg-white transition-fast shadow-sm hover-shadow ${selectedColor?.id === color.id ? 'border-gold border-2' : ''}" style="cursor:pointer" data-id="${color.id}">
                    <button type="button" class="color-swatch w-100 border-0 d-block" style="height:120px;background-color:${color.hex}" aria-label="Preview ${color.name}"></button>
                    <div class="p-3"><h6 class="fw-bold text-navy mb-1 text-truncate">${color.name}</h6>
                        <div class="d-flex justify-content-between align-items-center"><small class="text-slate">${color.hex}</small>
                            <button type="button" class="btn btn-link p-0 fav-btn transition-fast ${saved ? 'text-danger' : 'text-slate'}" data-id="${color.id}" aria-label="${saved ? 'Remove' : 'Save'} ${color.name} favorite" aria-pressed="${saved}"><i class="bi ${saved ? 'bi-heart-fill' : 'bi-heart'}"></i></button>
                        </div>
                    </div>
                </div>`;
            column.querySelector('.color-card').addEventListener('click', event => {
                if (event.target.closest('.fav-btn')) return;
                selectColor(color);
                if (compareMode && (!compareA || !compareB)) setupCompare(color);
            });
            column.querySelector('.fav-btn').addEventListener('click', event => { event.stopPropagation(); toggleFavorite(color.id); });
            grid.appendChild(column);
        });
    }

    function applyToRoom(color) {
        roomContainer.querySelectorAll('.room-wall').forEach(wall => { wall.style.fill = color.hex; });
    }
    function loadRoom(id) {
        // Bundled SVG markup supports file:// previews without local fetch/CORS.
        roomContainer.innerHTML = colorRoomTemplates[id] || colorRoomTemplates.living;
        applyToRoom(selectedColor || colorData[0]);
    }
    function updateSelectedPanel(color) {
        byId('selName').textContent = color.name;
        byId('selHex').textContent = color.hex;
        byId('selTone').textContent = color.tone;
        byId('selRec').textContent = color.room;
        const saved = favorites.includes(color.id);
        byId('btnSaveColor').innerHTML = `<i class="bi ${saved ? 'bi-heart-fill' : 'bi-heart'} me-2"></i> ${saved ? 'Saved Color' : 'Save Color'}`;
        byId('btnSaveColor').setAttribute('aria-pressed', String(saved));
    }
    function selectColor(color) {
        if (!color) return;
        selectedColor = color;
        applyToRoom(color);
        updateSelectedPanel(color);
        renderGrid();
    }
    function toggleFavorite(id) {
        favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
        try { localStorage.setItem('chromora_favorites', JSON.stringify(favorites)); } catch { /* Keep in-memory favorites. */ }
        renderGrid();
        renderFavorites();
        if (selectedColor) updateSelectedPanel(selectedColor);
    }
    function scrollToPreview() {
        byId('visualizer-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function renderFavorites() {
        const container = byId('favoritesGrid');
        container.replaceChildren();
        if (!favorites.length) container.innerHTML = '<div class="col-12 text-slate"><p>Your favorite colors will appear here.</p></div>';
        favorites.forEach(id => {
            const color = colorData.find(c => c.id === id);
            const item = document.createElement('div');
            item.className = 'd-flex align-items-center mb-3 p-2 border rounded-3 bg-white shadow-sm';
            item.innerHTML = `<div class="rounded-circle me-3" style="width:40px;height:40px;background-color:${color.hex};border:1px solid #ddd"></div>
                <div class="flex-grow-1"><h6 class="mb-0 fw-bold text-navy">${color.name}</h6><small class="text-slate">${color.hex}</small></div>
                <button type="button" class="btn btn-sm btn-outline-danger remove-fav" aria-label="Remove ${color.name} favorite"><i class="bi bi-trash"></i></button>
                <button type="button" class="btn btn-sm btn-navy ms-2 apply-fav" aria-label="Preview ${color.name}"><i class="bi bi-eye"></i></button>`;
            item.querySelector('.remove-fav').addEventListener('click', () => toggleFavorite(id));
            item.querySelector('.apply-fav').addEventListener('click', () => { selectColor(color); scrollToPreview(); });
            container.appendChild(item);
        });
        const hexes = favorites.map(id => colorData.find(c => c.id === id).hex.slice(1)).join(',');
        byId('btnEstimate').href = hexes ? `estimate.html?colors=${encodeURIComponent(hexes)}` : 'estimate.html';
    }
    function setupCompare(color) {
        compareMode = true;
        if (!compareA) compareA = color;
        else if (compareA.id !== color.id) compareB = color;
        updateCompareUI();
    }
    function updateCompareUI() {
        byId('compareSection').classList.toggle('d-none', !compareMode);
        [['A', compareA], ['B', compareB]].forEach(([side, color]) => {
            byId(`comp${side}Swatch`).style.backgroundColor = color?.hex || '#eee';
            byId(`comp${side}Name`).textContent = color?.name || `Select Color ${side}`;
        });
    }
    function renderPalettes() {
        const container = byId('palettesGrid');
        container.replaceChildren();
        paletteData.forEach(palette => {
            const column = document.createElement('div');
            column.className = 'col-md-6 col-lg-4 mb-4';
            const swatches = palette.colors.map(id => {
                const color = colorData.find(c => c.id === id);
                return `<div class="flex-fill" style="height:80px;background-color:${color.hex}" title="${color.name}"></div>`;
            }).join('');
            column.innerHTML = `<div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                <div class="d-flex w-100">${swatches}</div><div class="p-4 flex-grow-1 d-flex flex-column">
                <h5 class="fw-bold text-navy mb-2">${palette.name}</h5><p class="text-slate small mb-3 flex-grow-1">${palette.mood}</p>
                <p class="text-navy small fw-bold mb-3"><i class="bi bi-house me-1 text-gold"></i> ${palette.room}</p>
                <button type="button" class="btn btn-outline-navy btn-sm rounded-pill w-100 preview-pal">Preview Palette</button></div></div>`;
            column.querySelector('.preview-pal').addEventListener('click', () => {
                activeCategory = 'All Colors'; searchQuery = ''; searchInput.value = '';
                renderFilters();
                selectColor(colorData.find(c => c.id === palette.colors[0]));
                scrollToPreview();
            });
            container.appendChild(column);
        });
    }
    function renderRoomRecs() {
        const container = byId('roomRecsGrid');
        container.replaceChildren();
        roomData.forEach(room => {
            const column = document.createElement('div');
            column.className = 'col-md-6 col-lg-4 mb-4';
            const swatches = room.recs.map(id => {
                const color = colorData.find(c => c.id === id);
                return `<div class="rounded-circle border d-inline-block me-2 shadow-sm" style="width:40px;height:40px;background-color:${color.hex}" title="${color.name}"></div>`;
            }).join('');
            column.innerHTML = `<div class="card border border-soft rounded-4 p-4 h-100 bg-white transition-fast hover-shadow">
                <h5 class="fw-bold text-navy mb-3">${room.name}</h5><div class="mb-4">${swatches}</div>
                <button type="button" class="btn btn-link text-gold p-0 text-decoration-none fw-bold apply-rec">Try in ${room.name} <i class="bi bi-arrow-right"></i></button></div>`;
            column.querySelector('.apply-rec').addEventListener('click', () => {
                roomSelect.value = room.id;
                loadRoom(room.id);
                selectColor(colorData.find(c => c.id === room.recs[0]));
                scrollToPreview();
            });
            container.appendChild(column);
        });
    }

    searchInput.addEventListener('input', event => { searchQuery = event.target.value.trim().toLowerCase(); renderGrid(); });
    roomSelect.addEventListener('change', () => loadRoom(roomSelect.value));
    byId('btnSaveColor').addEventListener('click', () => { if (selectedColor) toggleFavorite(selectedColor.id); });
    byId('btnCompare').addEventListener('click', () => { if (selectedColor) setupCompare(selectedColor); });
    byId('btnResetCompare').addEventListener('click', () => { compareA = null; compareB = null; compareMode = false; updateCompareUI(); });
    byId('compASwatch').addEventListener('click', () => { if (compareA) applyToRoom(compareA); });
    byId('compBSwatch').addEventListener('click', () => { if (compareB) applyToRoom(compareB); });
    byId('btnResetPreview').addEventListener('click', () => {
        selectedColor = null;
        applyToRoom(colorData[0]);
        byId('selName').textContent = 'Select a Color';
        ['selHex', 'selTone', 'selRec'].forEach(id => { byId(id).textContent = '---'; });
        byId('btnSaveColor').innerHTML = '<i class="bi bi-heart me-2"></i> Save Color';
        byId('btnSaveColor').setAttribute('aria-pressed', 'false');
        renderGrid();
    });
    byId('btnCopyHex').addEventListener('click', async () => {
        if (!selectedColor) return;
        const button = byId('btnCopyHex');
        const original = button.innerHTML;
        try {
            await navigator.clipboard.writeText(selectedColor.hex);
            button.textContent = 'Copied!';
        } catch { button.textContent = `Copy: ${selectedColor.hex}`; }
        setTimeout(() => { button.innerHTML = original; }, 2000);
    });
    renderFilters(); renderGrid(); loadRoom(roomSelect.value);
    renderFavorites(); renderPalettes(); renderRoomRecs();
});
