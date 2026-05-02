// ── Options Screen ────────────────────────────────────────────

// Shared with goals.js — mutate properties in-place, never reassign
export const dynSettings = { enabled: false, adjustment: 0.01 };

let _getSaveJSON  = null;
let _loadSaveJSON = null;

// ── Init ──────────────────────────────────────────────────────

export function init_options(getSaveJSON, loadSaveJSON) {
    _getSaveJSON  = getSaveJSON;
    _loadSaveJSON = loadSaveJSON;

    document.getElementById('options-btn')?.addEventListener('click', _open);
    document.getElementById('options-back')?.addEventListener('click', _close);
    document.getElementById('opt-export-btn')?.addEventListener('click', _openExportPopup);
    document.getElementById('opt-import-btn')?.addEventListener('click', _openImportPopup);
    _initDynControls();
}

// ── Open / Close ──────────────────────────────────────────────

function _open() {
    document.getElementById('options-screen').classList.remove('hidden');
}

function _close() {
    document.getElementById('options-screen').classList.add('hidden');
}

// ── Popup helper ──────────────────────────────────────────────

function _makePopup(label, bodyEl) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    const box = document.createElement('div');
    box.className = 'popup-box';

    const title = document.createElement('div');
    title.className = 'popup-label';
    title.textContent = label;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'hud-btn popup-close';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', () => overlay.remove());

    box.appendChild(title);
    box.appendChild(bodyEl);
    box.appendChild(closeBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    return { overlay, box };
}

// ── Export popup ──────────────────────────────────────────────

function _openExportPopup() {
    const json    = _getSaveJSON();
    const encoded = btoa(unescape(encodeURIComponent(json)));

    const ta = document.createElement('textarea');
    ta.className = 'opt-ta popup-ta';
    ta.readOnly = true;
    ta.value = encoded;
    ta.addEventListener('click', () => ta.select());

    const copyBtn = document.createElement('button');
    copyBtn.className = 'hud-btn';
    copyBtn.textContent = 'COPY';
    copyBtn.addEventListener('click', () => {
        ta.select();
        document.execCommand('copy');
        copyBtn.textContent = 'COPIED';
        setTimeout(() => { copyBtn.textContent = 'COPY'; }, 1500);
    });

    const body = document.createElement('div');
    body.className = 'popup-body';
    body.appendChild(ta);
    body.appendChild(copyBtn);

    _makePopup('// EXPORT_SAVE', body);
}

// ── Import popup ──────────────────────────────────────────────

function _openImportPopup() {
    const ta = document.createElement('textarea');
    ta.className = 'opt-ta popup-ta';
    ta.placeholder = 'PASTE SAVE STRING HERE...';

    const msg = document.createElement('span');
    msg.className = 'opt-msg';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'hud-btn';
    loadBtn.textContent = 'LOAD';
    loadBtn.addEventListener('click', () => {
        if (!ta.value.trim()) return;
        try {
            const json = decodeURIComponent(escape(atob(ta.value.trim())));
            _loadSaveJSON(json);
            msg.textContent = 'LOADED.';
            msg.style.color = 'var(--amber)';
            setTimeout(() => { document.querySelector('.popup-overlay')?.remove(); }, 900);
        } catch {
            msg.textContent = 'ERROR: INVALID SAVE STRING';
            msg.style.color = 'var(--red)';
        }
    });

    const body = document.createElement('div');
    body.className = 'popup-body';
    body.appendChild(ta);
    body.appendChild(loadBtn);
    body.appendChild(msg);

    _makePopup('// IMPORT_SAVE', body);
}

// ── Dynamic difficulty controls ───────────────────────────────

function _initDynControls() {
    const toggle = document.getElementById('dyn-toggle');
    const input  = document.getElementById('dyn-adj-input');
    if (!toggle || !input) return;

    toggle.checked = dynSettings.enabled;
    input.value    = dynSettings.adjustment;

    toggle.addEventListener('change', () => {
        dynSettings.enabled = toggle.checked;
    });

    input.addEventListener('change', () => {
        let v = parseFloat(input.value);
        if (isNaN(v)) v = dynSettings.adjustment;
        v = Math.min(1, Math.max(0, v));
        // Round to 3 decimal places to avoid floating-point noise
        v = Math.round(v * 1000) / 1000;
        dynSettings.adjustment = v;
        input.value = v;
    });
}

// ── Save / Load ───────────────────────────────────────────────

export function save_dyn_settings() {
    return { enabled: dynSettings.enabled, adjustment: dynSettings.adjustment };
}

export function load_dyn_settings(data) {
    if (!data) return;
    if (data.enabled    !== undefined) dynSettings.enabled    = data.enabled;
    if (data.adjustment !== undefined) dynSettings.adjustment = data.adjustment;
    // Sync UI if already rendered
    const toggle = document.getElementById('dyn-toggle');
    const input  = document.getElementById('dyn-adj-input');
    if (toggle) toggle.checked = dynSettings.enabled;
    if (input)  input.value    = dynSettings.adjustment;
}