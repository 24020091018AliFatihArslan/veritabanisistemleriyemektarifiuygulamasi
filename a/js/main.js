// ============================================================
//  YEMEK TARİFİ - Ana Sayfa JavaScript (index.html)
// ============================================================

let currentFilter = 'all';
let currentSort   = 'newest';
let currentSearch = '';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    renderRecipes();
    updateResultsCount();

    // Sticky navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 40
            ? 'rgba(15,14,23,0.97)'
            : 'rgba(15,14,23,0.85)';
    });
});

// ---- RENDER RECIPES ----
function getFilteredSortedRecipes() {
    let list = getTarifler();

    // Search
    if (currentSearch.trim()) {
        const q = currentSearch.toLowerCase();
        list = list.filter(r =>
            r.adi.toLowerCase().includes(q) ||
            (r.aciklama && r.aciklama.toLowerCase().includes(q)) ||
            (CATEGORIES[r.kategoriId] && CATEGORIES[r.kategoriId].adi.toLowerCase().includes(q))
        );
    }

    // Category filter
    if (currentFilter !== 'all') {
        list = list.filter(r => getCategoryName(r.kategoriId) === currentFilter);
    }

    // Sort
    if (currentSort === 'fastest') {
        list.sort((a, b) => (a.hazirlik + a.pisirme) - (b.hazirlik + b.pisirme));
    } else if (currentSort === 'easy') {
        const o = { 'Kolay': 0, 'Orta': 1, 'Zor': 2 };
        list.sort((a, b) => o[a.zorluk] - o[b.zorluk]);
    } else if (currentSort === 'name') {
        list.sort((a, b) => a.adi.localeCompare(b.adi, 'tr'));
    } else {
        list.sort((a, b) => b.id - a.id);
    }

    return list;
}

function renderRecipes() {
    const grid  = document.getElementById('recipeGrid');
    const empty = document.getElementById('emptyState');
    const list  = getFilteredSortedRecipes();

    if (!list.length) {
        grid.innerHTML  = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    grid.innerHTML = list.map((r, i) => {
        const catName  = getCategoryName(r.kategoriId);
        const catIcon  = getCategoryIcon(r.kategoriId);
        const diffCls  = getDifficultyClass(r.zorluk);
        const totalMin = r.hazirlik + r.pisirme;
        const delay    = Math.min(i * 0.05, 0.4);

        return `
        <div class="recipe-card" style="animation-delay:${delay}s" onclick="openRecipeModal(${r.id})">
            <div class="recipe-card-img">
                ${r.fotograf
                    ? `<img src="${r.fotograf}" alt="${r.adi}" loading="lazy">`
                    : `<span class="card-emoji">${r.emoji || '🍴'}</span>`}
                <span class="card-badge ${diffCls}">${r.zorluk}</span>
                <span class="card-cat-badge">${catIcon} ${catName}</span>
            </div>
            <div class="recipe-card-body">
                <div class="recipe-card-title">${r.adi}</div>
                <div class="recipe-card-desc">${r.aciklama || ''}</div>
                <div class="recipe-card-meta">
                    <span class="meta-item">⏱️ ${totalMin} dk</span>
                    <span class="meta-item">🍽️ ${r.porsiyon} kişi</span>
                    <span class="meta-item">👨‍🍳 ${r.zorluk}</span>
                </div>
                <div class="recipe-card-actions">
                    <button class="card-btn card-btn-detail" onclick="event.stopPropagation();openRecipeModal(${r.id})">📖 Detay</button>
                    <button class="card-btn card-btn-edit" onclick="event.stopPropagation();editRecipe(${r.id})">✏️ Düzenle</button>
                    <button class="card-btn card-btn-del" onclick="event.stopPropagation();deleteRecipe(${r.id})">🗑️</button>
                </div>
            </div>
        </div>`;
    }).join('');

    updateResultsCount();
}

function updateResultsCount() {
    const count = document.getElementById('resultsCount');
    const n = getFilteredSortedRecipes().length;
    if (count) count.textContent = `${n} tarif gösteriliyor`;
}

// ---- FILTER & SEARCH ----
function filterCategory(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderRecipes();
}

function filterRecipes() {
    currentSearch = document.getElementById('searchInput').value;
    renderRecipes();
}

function sortRecipes(val) {
    currentSort = val;
    renderRecipes();
}

// ---- MODAL ----
function openRecipeModal(id) {
    const list = getTarifler();
    const r = list.find(x => x.id === id);
    if (!r) return;

    const catName = getCategoryName(r.kategoriId);
    const catIcon = getCategoryIcon(r.kategoriId);
    const total   = r.hazirlik + r.pisirme;
    const diffCls = getDifficultyClass(r.zorluk);

    const ingredientsHtml = r.malzemeler && r.malzemeler.length
        ? `<ul>${r.malzemeler.map(m =>
            `<li>${m.adi} — <strong style="color:var(--clr-accent)">${m.miktar} ${m.birim}</strong></li>`
          ).join('')}</ul>`
        : '<p style="color:var(--clr-text3)">Malzeme listesi eklenmemiş.</p>';

    const stepsHtml = r.talimatlar && r.talimatlar.length
        ? `<div class="modal-steps">${r.talimatlar.map((s, i) =>
            `<div class="modal-step">
                <div class="step-num">${i+1}</div>
                <div class="step-text">${s}</div>
             </div>`
          ).join('')}</div>`
        : '<p style="color:var(--clr-text3)">Talimatlar eklenmemiş.</p>';

    document.getElementById('modalContent').innerHTML = `
        <div style="text-align:center;font-size:4rem;margin-bottom:1rem">${r.emoji || catIcon}</div>
        <h2 class="modal-recipe-title">${r.adi}</h2>
        <div class="modal-meta">
            <span class="modal-meta-item">⏱️ Hazırlık: ${r.hazirlik} dk</span>
            <span class="modal-meta-item">🔥 Pişirme: ${r.pisirme} dk</span>
            <span class="modal-meta-item">⏰ Toplam: ${total} dk</span>
            <span class="modal-meta-item">🍽️ ${r.porsiyon} kişilik</span>
            <span class="modal-meta-item difficulty-badge ${diffCls}">${r.zorluk}</span>
            <span class="modal-meta-item">${catIcon} ${catName}</span>
        </div>
        <p style="color:var(--clr-text2);line-height:1.7;margin-bottom:1.5rem">${r.aciklama || ''}</p>
        <div class="modal-section">
            <h3>🧺 Malzemeler</h3>
            ${ingredientsHtml}
        </div>
        <div class="modal-section">
            <h3>👨‍🍳 Yapılışı</h3>
            ${stepsHtml}
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;">
            <button class="btn-primary" onclick="editRecipe(${r.id})">✏️ Düzenle</button>
            <button class="btn-danger" onclick="deleteRecipe(${r.id});closeModal()">🗑️ Sil</button>
            <button class="btn-secondary" onclick="addToShoppingFromModal(${r.id})">🛒 Alışveriş Listesine Ekle</button>
        </div>
    `;
    document.getElementById('recipeModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('recipeModal').classList.remove('open');
    document.body.style.overflow = '';
}

// ---- CRUD ----
function editRecipe(id) {
    closeModal();
    window.location.href = `tarif-yonetim.html?edit=${id}`;
}

function deleteRecipe(id) {
    if (!confirm('Bu tarifi silmek istediğinizden emin misiniz?')) return;
    const list = getTarifler().filter(r => r.id !== id);
    saveTarifler(list);
    renderRecipes();
    showToast('Tarif silindi.', 'error');
}

function addToShoppingFromModal(id) {
    const r = getTarifler().find(x => x.id === id);
    if (!r) return;
    const lists = getShoppingLists();
    const newList = {
        id: Date.now(),
        adi: `${r.adi} - Alışveriş Listesi`,
        kalemler: (r.malzemeler || []).map(m => ({ ...m, satin: false }))
    };
    lists.push(newList);
    saveShoppingLists(lists);
    showToast(`"${r.adi}" alışveriş listesine eklendi! 🛒`, 'success');
}

// ---- TOAST ----
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3000);
}
