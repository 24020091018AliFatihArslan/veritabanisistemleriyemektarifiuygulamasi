// ============================================================
//  YEMEK TARİFİ - Yönetim Sayfası JavaScript (tarif-yonetim.html)
// ============================================================

let currentIngredients = []; // Form'daki anlık malzeme listesi
let currentSteps = [];       // Form'daki anlık adımlar
let activePanel = 'tarif-listesi';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    renderTable();
    renderMalzemeGrid();
    renderRecipePicker();
    populateDetailSelect();
    updateSidebarStats();

    // URL parametresiyle edit modunda aç
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        showTab('yeni-tarif');
        loadRecipeForEdit(parseInt(editId));
    } else {
        showTab('tarif-listesi');
    }

    // Anchor hash
    if (window.location.hash === '#alisveris') showTab('alisveris');
});

// ---- TAB NAVIGATION ----
function showTab(tabId) {
    document.querySelectorAll('.mgmt-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById(`panel-${tabId}`);
    const btn   = document.getElementById(`tab-${tabId}`);
    if (panel) panel.classList.add('active');
    if (btn)   btn.classList.add('active');
    activePanel = tabId;
}

// ---- POPULATE SELECTS ----
function populateSelects() {
    const malzSel  = document.getElementById('malzemeSelect');
    const birimSel = document.getElementById('malzemeBirim');
    const newBirim = document.getElementById('newMalzemeBirim');
    const malzemeler = getMalzemeler();

    malzSel.innerHTML = '<option value="">-- Malzeme Seçin --</option>' +
        malzemeler.map(m => `<option value="${m.id}" data-birim="${m.birimId}">${m.adi}</option>`).join('');

    const birimOpts = BIRIMLER.map(b => `<option value="${b.id}">${b.adi} (${b.kisaltma})</option>`).join('');
    birimSel.innerHTML = '<option value="">Birim</option>' + birimOpts;
    if (newBirim) newBirim.innerHTML = birimOpts;

    // Malzeme seçilince varsayılan birimi otomatik seç
    malzSel.addEventListener('change', () => {
        const opt = malzSel.options[malzSel.selectedIndex];
        const birimId = opt.dataset.birim;
        if (birimId) birimSel.value = birimId;
    });
}

// ---- SIDEBAR STATS ----
function updateSidebarStats() {
    document.getElementById('ss-count').textContent    = getTarifler().length;
    document.getElementById('ss-malzeme').textContent  = getMalzemeler().length;
    document.getElementById('ss-liste').textContent    = getShoppingLists().length;
}

// ============================================================
//  PANEL: TARİF LİSTESİ
// ============================================================
function renderTable(filter = '') {
    const tbody = document.getElementById('recipeTableBody');
    let list = getTarifler();
    if (filter) {
        const q = filter.toLowerCase();
        list = list.filter(r => r.adi.toLowerCase().includes(q));
    }
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-text3)">Kayıt bulunamadı</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map((r, i) => {
        const catIcon = getCategoryIcon(r.kategoriId);
        const catName = getCategoryName(r.kategoriId);
        const diffCls = r.zorluk === 'Kolay' ? 'diff-easy' : r.zorluk === 'Zor' ? 'diff-hard' : 'diff-medium';
        const total   = r.hazirlik + r.pisirme;
        return `
        <tr>
            <td>${i+1}</td>
            <td><strong>${r.emoji || ''} ${r.adi}</strong></td>
            <td>${catIcon} ${catName}</td>
            <td>⏱️ ${total} dk</td>
            <td><span class="difficulty-badge ${diffCls}">${r.zorluk}</span></td>
            <td>${r.porsiyon} kişi</td>
            <td>
                <div class="tbl-actions">
                    <button class="tbl-btn tbl-btn-view" onclick="viewDetail(${r.id})">👁 Detay</button>
                    <button class="tbl-btn tbl-btn-edit" onclick="loadRecipeForEdit(${r.id})">✏️ Düzenle</button>
                    <button class="tbl-btn tbl-btn-del"  onclick="deleteFromTable(${r.id})">🗑️ Sil</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterList() {
    renderTable(document.getElementById('listSearch').value);
}

function deleteFromTable(id) {
    if (!confirm('Bu tarifi silmek istediğinizden emin misiniz?')) return;
    const list = getTarifler().filter(r => r.id !== id);
    saveTarifler(list);
    renderTable();
    renderRecipePicker();
    populateDetailSelect();
    updateSidebarStats();
    showToast('Tarif başarıyla silindi.', 'error');
}

function viewDetail(id) {
    showTab('tarif-detay');
    document.getElementById('detayTarifSelect').value = id;
    loadDetailView(id);
}

// ============================================================
//  PANEL: YENİ TARİF / CRUD FORM
// ============================================================
function resetForm() {
    document.getElementById('tarifForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = '➕ Yeni Tarif Ekle';
    document.getElementById('formModeBadge').textContent = 'EKLE';
    document.getElementById('formModeBadge').classList.remove('edit-mode');
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = '💾 Kaydet';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'flex';
    currentIngredients = [];
    currentSteps = [];
    renderIngredientList();
    renderStepsList();
}

function loadRecipeForEdit(id) {
    const list = getTarifler();
    const r = list.find(x => x.id === id);
    if (!r) return;

    showTab('yeni-tarif');

    document.getElementById('editId').value         = r.id;
    document.getElementById('tarifAdi').value       = r.adi;
    document.getElementById('kategoriId').value     = r.kategoriId;
    document.getElementById('hazirlikSuresi').value = r.hazirlik;
    document.getElementById('pisirmeSuresi').value  = r.pisirme;
    document.getElementById('porsiyon').value       = r.porsiyon;
    document.getElementById('zorlukDerecesi').value = r.zorluk;
    document.getElementById('aciklama').value       = r.aciklama || '';

    currentIngredients = r.malzemeler ? [...r.malzemeler] : [];
    currentSteps       = r.talimatlar ? [...r.talimatlar] : [];
    renderIngredientList();
    renderStepsList();

    if (r.fotograf) {
        document.getElementById('photoPreview').src = r.fotograf;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('photoPlaceholder').style.display = 'none';
    }

    document.getElementById('formTitle').textContent = '✏️ Tarif Düzenle';
    document.getElementById('formModeBadge').textContent = 'DÜZENLE';
    document.getElementById('formModeBadge').classList.add('edit-mode');
    document.getElementById('deleteBtn').style.display = 'inline-flex';
    document.getElementById('saveBtn').textContent = '💾 Güncelle';
}

function saveRecipe(e) {
    e.preventDefault();
    const id       = document.getElementById('editId').value;
    const adi      = document.getElementById('tarifAdi').value.trim();
    const katId    = parseInt(document.getElementById('kategoriId').value);
    const hazirlik = parseInt(document.getElementById('hazirlikSuresi').value) || 0;
    const pisirme  = parseInt(document.getElementById('pisirmeSuresi').value)  || 0;
    const porsiyon = parseInt(document.getElementById('porsiyon').value) || 1;
    const zorluk   = document.getElementById('zorlukDerecesi').value;
    const aciklama = document.getElementById('aciklama').value.trim();
    const catIcon  = getCategoryIcon(katId);

    if (!adi || !katId) {
        showToast('Tarif adı ve kategori zorunludur!', 'error');
        return;
    }

    let list = getTarifler();

    if (id) {
        // Güncelle
        const idx = list.findIndex(r => r.id === parseInt(id));
        if (idx !== -1) {
            list[idx] = { ...list[idx], adi, kategoriId: katId, hazirlik, pisirme, porsiyon, zorluk, aciklama, malzemeler: currentIngredients, talimatlar: currentSteps, emoji: catIcon };
        }
        showToast(`"${adi}" güncellendi! ✅`, 'success');
    } else {
        // Ekle
        const newId = Math.max(0, ...list.map(r => r.id)) + 1;
        list.push({ id: newId, adi, kategoriId: katId, hazirlik, pisirme, porsiyon, zorluk, aciklama, malzemeler: currentIngredients, talimatlar: currentSteps, emoji: catIcon });
        showToast(`"${adi}" başarıyla eklendi! ✅`, 'success');
    }

    saveTarifler(list);
    resetForm();
    renderTable();
    renderRecipePicker();
    populateDetailSelect();
    updateSidebarStats();
    showTab('tarif-listesi');
}

function deleteCurrentRecipe() {
    const id = document.getElementById('editId').value;
    if (!id) return;
    if (!confirm('Bu tarifi silmek istediğinizden emin misiniz?')) return;
    const list = getTarifler().filter(r => r.id !== parseInt(id));
    saveTarifler(list);
    resetForm();
    renderTable();
    renderRecipePicker();
    populateDetailSelect();
    updateSidebarStats();
    showToast('Tarif silindi.', 'error');
    showTab('tarif-listesi');
}

// ---- PHOTO PREVIEW ----
function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('photoPreview').src = e.target.result;
        document.getElementById('photoPreview').style.display = 'block';
        document.getElementById('photoPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// ---- INGREDIENTS ----
function addIngredient() {
    const sel    = document.getElementById('malzemeSelect');
    const miktar = parseFloat(document.getElementById('malzemeMiktar').value);
    const birimSel = document.getElementById('malzemeBirim');
    const birimId  = parseInt(birimSel.value);
    const birim    = BIRIMLER.find(b => b.id === birimId);

    if (!sel.value) { showToast('Lütfen malzeme seçin!', 'error'); return; }
    if (!miktar || miktar <= 0) { showToast('Miktar giriniz!', 'error'); return; }

    const malzemeAdi = sel.options[sel.selectedIndex].text;
    const exists = currentIngredients.find(i => i.id === parseInt(sel.value));
    if (exists) { showToast('Bu malzeme zaten ekli!', 'error'); return; }

    currentIngredients.push({
        id: parseInt(sel.value), adi: malzemeAdi, miktar,
        birim: birim ? birim.kisaltma : ''
    });
    renderIngredientList();
    document.getElementById('malzemeMiktar').value = '';
}

function removeIngredient(id) {
    currentIngredients = currentIngredients.filter(i => i.id !== id);
    renderIngredientList();
}

function renderIngredientList() {
    const el = document.getElementById('ingredientList');
    if (!currentIngredients.length) {
        el.innerHTML = '<div class="ing-empty">Henüz malzeme eklenmedi</div>';
        return;
    }
    el.innerHTML = currentIngredients.map(i => `
        <div class="ing-item">
            <span class="ing-item-name">${i.adi}</span>
            <span class="ing-item-qty">${i.miktar} ${i.birim}</span>
            <button class="ing-remove" onclick="removeIngredient(${i.id})" title="Kaldır">✕</button>
        </div>
    `).join('');
}

// ---- STEPS ----
function addStep() {
    const txt = document.getElementById('newStepText').value.trim();
    if (!txt) { showToast('Adım metni giriniz!', 'error'); return; }
    currentSteps.push(txt);
    document.getElementById('newStepText').value = '';
    renderStepsList();
}

function removeStep(idx) {
    currentSteps.splice(idx, 1);
    renderStepsList();
}

function renderStepsList() {
    const el = document.getElementById('stepsList');
    if (!currentSteps.length) { el.innerHTML = ''; return; }
    el.innerHTML = currentSteps.map((s, i) => `
        <div class="step-item">
            <div class="step-num-badge">${i+1}</div>
            <div class="step-content">${s}</div>
            <button class="step-del" onclick="removeStep(${i})">✕</button>
        </div>
    `).join('');
}

// ============================================================
//  PANEL: MALZEME SEÇME
// ============================================================
let malzemeFilter = 'all';

function renderMalzemeGrid(search = '', kat = '') {
    const grid = document.getElementById('malzemeGrid');
    let list = getMalzemeler();
    if (search) {
        const q = search.toLowerCase();
        list = list.filter(m => m.adi.toLowerCase().includes(q) || m.kategori.toLowerCase().includes(q));
    }
    if (kat && kat !== 'all') list = list.filter(m => m.kategori === kat);

    if (!list.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--clr-text3)">Malzeme bulunamadı</div>`;
        return;
    }
    grid.innerHTML = list.map(m => `
        <div class="malzeme-card" id="mc-${m.id}" onclick="toggleMalzemeSelect(${m.id})">
            <div class="malzeme-card-name">${m.adi}</div>
            <div class="malzeme-card-kat">${m.kategori}</div>
        </div>
    `).join('');
}

function filterMalzeme() {
    renderMalzemeGrid(document.getElementById('malzemeSearch').value, malzemeFilter === 'all' ? '' : malzemeFilter);
}

function filterMalzemeKat(kat, btn) {
    malzemeFilter = kat;
    document.querySelectorAll('.mcat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    filterMalzeme();
}

function toggleMalzemeSelect(id) {
    const card = document.getElementById(`mc-${id}`);
    card.classList.toggle('selected');
}

function showAddMalzemeModal() {
    document.getElementById('addMalzemeModal').style.display = 'flex';
}
function hideAddMalzemeModal() {
    document.getElementById('addMalzemeModal').style.display = 'none';
    document.getElementById('newMalzemeAdi').value = '';
}

function saveMalzeme() {
    const adi   = document.getElementById('newMalzemeAdi').value.trim();
    const kat   = document.getElementById('newMalzemeKat').value;
    const birim = parseInt(document.getElementById('newMalzemeBirim').value);
    if (!adi) { showToast('Malzeme adı giriniz!', 'error'); return; }

    const list = getMalzemeler();
    const newId = Math.max(0, ...list.map(m => m.id)) + 1;
    list.push({ id: newId, adi, kategori: kat, birimId: birim });
    saveMalzemeler(list);
    populateSelects();
    renderMalzemeGrid();
    updateSidebarStats();
    hideAddMalzemeModal();
    showToast(`"${adi}" malzeme listesine eklendi!`, 'success');
}

// ============================================================
//  PANEL: TARİF DETAY
// ============================================================
function populateDetailSelect() {
    const sel = document.getElementById('detayTarifSelect');
    const list = getTarifler();
    sel.innerHTML = '<option value="">-- Tarif Seçin --</option>' +
        list.map(r => `<option value="${r.id}">${getCategoryIcon(r.kategoriId)} ${r.adi}</option>`).join('');
}

function loadDetailView(id) {
    const div = document.getElementById('detailView');
    if (!id) {
        div.innerHTML = `<div class="detail-empty"><span>📖</span><p>Detayını görüntülemek istediğiniz tarifi seçin.</p></div>`;
        return;
    }
    const r = getTarifler().find(x => x.id === parseInt(id));
    if (!r) return;

    const catName = getCategoryName(r.kategoriId);
    const catIcon = getCategoryIcon(r.kategoriId);
    const diffCls = r.zorluk === 'Kolay' ? 'diff-easy' : r.zorluk === 'Zor' ? 'diff-hard' : 'diff-medium';

    const ingHtml = r.malzemeler && r.malzemeler.length
        ? r.malzemeler.map(m => `
            <div class="detail-ing-row">
                <span>${m.adi}</span>
                <span class="detail-ing-qty">${m.miktar} ${m.birim}</span>
            </div>`).join('')
        : '<p style="color:var(--clr-text3)">Malzeme eklenmemiş.</p>';

    const stepsHtml = r.talimatlar && r.talimatlar.length
        ? r.talimatlar.map((s, i) => `
            <div class="detail-step">
                <div class="detail-step-num">${i+1}</div>
                <div class="detail-step-text">${s}</div>
            </div>`).join('')
        : '<p style="color:var(--clr-text3)">Talimatlar eklenmemiş.</p>';

    div.innerHTML = `
        <div class="detail-hero">
            <div class="detail-hero-emoji">${r.emoji || catIcon}</div>
            <h2 class="detail-title">${r.adi}</h2>
            <div class="detail-metas">
                <span class="detail-meta-chip">⏱️ Hazırlık: ${r.hazirlik} dk</span>
                <span class="detail-meta-chip">🔥 Pişirme: ${r.pisirme} dk</span>
                <span class="detail-meta-chip">⏰ Toplam: ${r.hazirlik + r.pisirme} dk</span>
                <span class="detail-meta-chip">🍽️ ${r.porsiyon} kişilik</span>
                <span class="detail-meta-chip difficulty-badge ${diffCls}">${r.zorluk}</span>
                <span class="detail-meta-chip">${catIcon} ${catName}</span>
            </div>
            <p class="detail-desc">${r.aciklama || ''}</p>
        </div>
        <div class="detail-section">
            <h3>🧺 Malzemeler</h3>
            <div class="detail-ingredients">${ingHtml}</div>
        </div>
        <div class="detail-section">
            <h3>👨‍🍳 Yapılış Adımları</h3>
            <div class="detail-steps">${stepsHtml}</div>
        </div>
        <div class="detail-actions">
            <button class="btn-primary" onclick="loadRecipeForEdit(${r.id})">✏️ Düzenle</button>
            <button class="btn-accent" onclick="addToShoppingCart(${r.id})">🛒 Alışveriş Listesine Ekle</button>
            <button class="btn-danger" onclick="deleteFromTable(${r.id})">🗑️ Sil</button>
        </div>
    `;
}

// ============================================================
//  PANEL: ALIŞVERİŞ LİSTESİ
// ============================================================
let activeShoppingItems = [];

function renderRecipePicker() {
    const el = document.getElementById('recipePicker');
    const list = getTarifler();
    el.innerHTML = list.map(r => `
        <div class="recipe-pick-item">
            <input type="checkbox" id="pick-${r.id}" value="${r.id}">
            <label for="pick-${r.id}" style="cursor:pointer;flex:1">${getCategoryIcon(r.kategoriId)} ${r.adi} (${r.hazirlik + r.pisirme} dk)</label>
        </div>
    `).join('');
}

function generateShoppingList() {
    const checked = Array.from(document.querySelectorAll('.recipe-pick-item input:checked'));
    if (!checked.length) { showToast('En az bir tarif seçin!', 'error'); return; }

    const tarifler = getTarifler();
    const merged = {};

    checked.forEach(cb => {
        const r = tarifler.find(x => x.id === parseInt(cb.value));
        if (!r || !r.malzemeler) return;
        r.malzemeler.forEach(m => {
            const key = m.adi;
            if (merged[key]) {
                merged[key].miktar += m.miktar;
            } else {
                merged[key] = { ...m, satin: false };
            }
        });
    });

    activeShoppingItems = Object.values(merged);
    const names = checked.map(cb => {
        const r = tarifler.find(x => x.id === parseInt(cb.value));
        return r ? r.adi : '';
    }).join(', ');
    document.getElementById('shoppingListTitle').textContent = `🛒 ${names}`;
    renderShoppingItems();
    showToast(`${activeShoppingItems.length} ürünlü alışveriş listesi oluşturuldu!`, 'success');
}

function renderShoppingItems() {
    const el = document.getElementById('shoppingItems');
    const summary = document.getElementById('shoppingSummary');

    if (!activeShoppingItems.length) {
        el.innerHTML = `<div class="shopping-empty"><span>🛒</span><p>Sol taraftan tarif seçerek alışveriş listesi oluşturun.</p></div>`;
        summary.style.display = 'none';
        return;
    }

    el.innerHTML = activeShoppingItems.map((item, i) => `
        <div class="shopping-item ${item.satin ? 'checked' : ''}" id="si-${i}">
            <input type="checkbox" ${item.satin ? 'checked' : ''} onchange="toggleShoppingItem(${i})">
            <span class="si-name">${item.adi}</span>
            <span class="si-qty">${item.miktar} ${item.birim}</span>
            <button class="si-del" onclick="removeShoppingItem(${i})">✕</button>
        </div>
    `).join('');

    const checked = activeShoppingItems.filter(i => i.satin).length;
    const total   = activeShoppingItems.length;
    document.getElementById('checkedCount').textContent = checked;
    document.getElementById('totalCount').textContent   = total;
    document.getElementById('progressFill').style.width = `${total ? (checked/total*100) : 0}%`;
    summary.style.display = 'block';
}

function toggleShoppingItem(idx) {
    activeShoppingItems[idx].satin = !activeShoppingItems[idx].satin;
    renderShoppingItems();
}

function removeShoppingItem(idx) {
    activeShoppingItems.splice(idx, 1);
    renderShoppingItems();
}

function addToShoppingCart(recipeId) {
    showTab('alisveris');
    const r = getTarifler().find(x => x.id === recipeId);
    if (!r || !r.malzemeler) return;
    r.malzemeler.forEach(m => {
        const exists = activeShoppingItems.find(i => i.adi === m.adi);
        if (exists) exists.miktar += m.miktar;
        else activeShoppingItems.push({ ...m, satin: false });
    });
    document.getElementById('shoppingListTitle').textContent = `🛒 ${r.adi}`;
    renderShoppingItems();
    showToast(`"${r.adi}" alışveriş listesine eklendi!`, 'success');
}

function createShoppingList() {
    activeShoppingItems = [];
    document.getElementById('shoppingListTitle').textContent = '🛒 Yeni Alışveriş Listesi';
    renderShoppingItems();
}

function checkAll() {
    activeShoppingItems.forEach(i => i.satin = true);
    renderShoppingItems();
}

function clearShoppingList() {
    if (!confirm('Alışveriş listesi temizlensin mi?')) return;
    activeShoppingItems = [];
    renderShoppingItems();
}

function printList() {
    const items = activeShoppingItems.map((i,n) =>
        `${n+1}. ${i.adi} — ${i.miktar} ${i.birim} ${i.satin ? '✓' : ''}`
    ).join('\n');
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Alışveriş Listesi</title><style>
        body{font-family:sans-serif;padding:2rem}h1{margin-bottom:1rem}pre{line-height:2}
    </style></head><body><h1>🛒 Alışveriş Listesi</h1>
    <p>${document.getElementById('shoppingListTitle').textContent}</p>
    <pre>${items}</pre></body></html>`);
    win.print();
}

// ---- TOAST ----
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
}
