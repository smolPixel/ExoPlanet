// ============================================================
//  UPGRADES  — buyable module chips rendered below inventory bar
// ============================================================

let _allResources        = null;
let _upgradeRandomNode   = null;
let _pushMessage         = null;
let _setConnTransferRate = null;

// ── Upgrade definitions ───────────────────────────────────────

export const UPGRADE_DEFS = {
    kp7: {
        id:          'kp7',
        label:       'KP-7',
        icon:        '🤖',
        cost:        [['Iron Plates', 100], ['Coils', 400], ['Wires', 200]],
        description: 'Autonomous maintenance robot. Each time you complete a daily objective, KP-7 has a 10% chance to act: upgrade a facility, deposit resources, or expand an inventory slot.',
    },
    conduit: {
        id:    'conduit',
        label: 'CONDUIT',
        icon:  '⇌',
        levels: [
            { cost: [['Iron Plates', 800], ['Screws', 1000]],                                              rate: 1 },
            { cost: [['Iron Plates', 40], ['Screws', 25], ['Coils', 10]],                               rate: 2 },
            { cost: [['Iron Plates', 80], ['Screws', 50], ['Coils', 25], ['Wires', 15]],                rate: 3 },
            { cost: [['Iron Plates', 150], ['Screws', 100], ['Coils', 60], ['Wires', 40]],              rate: 5 },
            { cost: [['Iron Plates', 300], ['Screws', 200], ['Coils', 120], ['Wires', 80]],             rate: 10 },
        ],
        description: 'Increases pipe bandwidth. Higher levels allow more resources to flow per connection per tick.',
    },
};

// ── Phase definitions ─────────────────────────────────────────

const PHASES = [
    {
        label:     'PHASE 0',
        objective: 'Purchase KP-7',
        entryMsg:  'Colony uplink established. First directive: procure a KP-7 maintenance unit to stabilise operations.',
        complete:  () => _owned.kp7 === true,
    },
    {
        label:     'PHASE 1',
        objective: 'Upgrade CONDUIT to L2',
        entryMsg:  'KP-7 integration confirmed. The pipeline is a bottleneck — upgrade CONDUIT to level 2.',
        complete:  () => (_owned.conduit || 0) >= 2,
    },
];

// ── Owned state ───────────────────────────────────────────────

const _owned = { kp7: false, conduit: 0 };  // conduit = current level (0 = not purchased)
let _currentPhase = 0;

// ── Init ─────────────────────────────────────────────────────

export function init_upgrades(allResources, upgradeRandomNodeFn, pushMessageFn, setConnTransferRateFn) {
    _allResources        = allResources;
    _upgradeRandomNode   = upgradeRandomNodeFn;
    _pushMessage         = pushMessageFn;
    _setConnTransferRate = setConnTransferRateFn;
    _renderUpgradesBar();
}

// ── Tooltip helpers (mirrors factories.js, shared element) ───

function _showTooltip(html, e) {
    const tt = document.getElementById('hud-tooltip');
    if (!tt) return;
    tt.innerHTML = html;
    tt.classList.remove('hidden');
    tt.style.left = (e.clientX + 16) + 'px';
    tt.style.top  = (e.clientY + 16) + 'px';
}
function _moveTooltip(e) {
    const tt = document.getElementById('hud-tooltip');
    if (!tt || tt.classList.contains('hidden')) return;
    tt.style.left = (e.clientX + 16) + 'px';
    tt.style.top  = (e.clientY + 16) + 'px';
}
function _hideTooltip() {
    document.getElementById('hud-tooltip')?.classList.add('hidden');
}

// ── Render ────────────────────────────────────────────────────

function _renderUpgradesBar() {
    const bar = document.getElementById('factory-upgrades-bar');
    if (!bar) return;
    bar.innerHTML = '';

    Object.values(UPGRADE_DEFS).forEach(upg => {
        if (upg.levels) {
            _renderLeveledChip(bar, upg);
        } else {
            _renderSimpleChip(bar, upg);
        }
    });
}

function _renderSimpleChip(bar, upg) {
    const owned = _owned[upg.id];
    const chip = document.createElement('div');
    chip.className = `upg-chip${owned ? ' upg-owned' : ''}`;
    chip.id = `upg-chip-${upg.id}`;
    chip.innerHTML =
        `<span class="upg-icon">${upg.icon}</span>` +
        `<span class="upg-label">${upg.label}</span>`;

    chip.addEventListener('mouseenter', (e) => {
        const costHtml = owned
            ? `<div class="tt-title" style="color:var(--green)">INSTALLED</div>`
            : `<div class="tt-title">COST</div><ul>${upg.cost.map(([k, a]) => `<li>${k} ×${a}</li>`).join('')}</ul>`;
        _showTooltip(
            `<div class="tt-title">${upg.label}</div>` +
            `<p class="tt-desc">${upg.description}</p>` +
            costHtml, e
        );
    });
    chip.addEventListener('mousemove', _moveTooltip);
    chip.addEventListener('mouseleave', _hideTooltip);
    if (!owned) chip.addEventListener('click', () => _buyUpgrade(upg.id));
    bar.appendChild(chip);
}

function _renderLeveledChip(bar, upg) {
    const level  = _owned[upg.id] || 0;
    const maxed  = level >= upg.levels.length;
    const partial = level > 0 && !maxed;

    const chip = document.createElement('div');
    chip.className = `upg-chip${maxed ? ' upg-owned' : partial ? ' upg-partial' : ''}`;
    chip.id = `upg-chip-${upg.id}`;
    chip.innerHTML =
        `<span class="upg-icon">${upg.icon}</span>` +
        `<span class="upg-label">${upg.label}</span>` +
        (level > 0 ? `<span class="upg-level">${maxed ? 'MAX' : 'L' + level}</span>` : '');

    chip.addEventListener('mouseenter', (e) => {
        const curRate  = level > 0 ? upg.levels[level - 1].rate : 0;
        const rateHtml = level > 0
            ? `<div class="tt-title">ACTIVE</div><ul><li>${curRate}/tick per pipe</li></ul>`
            : '';
        const costHtml = maxed
            ? `<div class="tt-title" style="color:var(--green)">MAXED OUT</div>`
            : (() => {
                const next = upg.levels[level];
                return `<div class="tt-title">NEXT LEVEL (L${level + 1})</div>` +
                    `<ul>${next.cost.map(([k, a]) => `<li>${k} ×${a}</li>`).join('')}</ul>` +
                    `<div class="tt-title">EFFECT</div><ul><li>${next.rate}/tick per pipe</li></ul>`;
              })();
        _showTooltip(
            `<div class="tt-title">${upg.label}</div>` +
            `<p class="tt-desc">${upg.description}</p>` +
            rateHtml + costHtml, e
        );
    });
    chip.addEventListener('mousemove', _moveTooltip);
    chip.addEventListener('mouseleave', _hideTooltip);
    if (!maxed) chip.addEventListener('click', () => _buyUpgrade(upg.id));
    bar.appendChild(chip);
}

// ── Phase overlay ─────────────────────────────────────────────

function _updatePhaseOverlay() {
    const el = document.getElementById('phase-overlay');
    if (!el) return;
    const phase = PHASES[_currentPhase];
    if (!phase) {
        el.innerHTML = `<div class="po-label">ALL PHASES COMPLETE</div>`;
    } else {
        el.innerHTML =
            `<div class="po-label">${phase.label}</div>` +
            `<div class="po-obj">▸ ${phase.objective}</div>`;
    }
}

export function init_phase_overlay() {
    const canvas = document.getElementById('factory-canvas');
    if (!canvas || document.getElementById('phase-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'phase-overlay';
    canvas.appendChild(overlay);
    _updatePhaseOverlay();
}

export function fire_phase_entry(phaseId) {
    const phase = PHASES[phaseId];
    if (phase?.entryMsg) _pushMessage?.(phase.entryMsg, 'story', 'kelpy');
}

function _checkPhaseAdvance() {
    const phase = PHASES[_currentPhase];
    if (!phase || !phase.complete()) return;
    _currentPhase++;
    const next = PHASES[_currentPhase];
    if (next) _pushMessage?.(next.entryMsg, 'story', 'kelpy');
    _updatePhaseOverlay();
}

// ── Purchase ──────────────────────────────────────────────────

function _buyUpgrade(id) {
    const upg = UPGRADE_DEFS[id];
    if (!upg || !_allResources) return;

    if (upg.levels) {
        // Leveled upgrade
        const level = _owned[id] || 0;
        if (level >= upg.levels.length) return;
        const levelDef = upg.levels[level];
        const d = _allResources.dictionnary;
        for (const [k, amt] of levelDef.cost) {
            if (!d[k] || d[k].quantity < amt) {
                _pushMessage?.(`⚠ Cannot afford ${upg.label} L${level + 1} — need more ${k}.`, 'warning');
                return;
            }
        }
        for (const [k, amt] of levelDef.cost) {
            d[k].quantity -= amt;
            _updateDisplay(k);
        }
        _owned[id] = level + 1;
        _setConnTransferRate?.(levelDef.rate);
        _renderUpgradesBar();
        const maxed = _owned[id] >= upg.levels.length;
        _pushMessage?.(
            `⇌ CONDUIT L${_owned[id]} installed — ${levelDef.rate}/tick per pipe.${maxed ? ' MAX BANDWIDTH.' : ''}`,
            'milestone'
        );
        _checkPhaseAdvance();
        return;
    }

    // Simple one-time upgrade
    if (_owned[id]) return;
    const d = _allResources.dictionnary;
    for (const [k, amt] of upg.cost) {
        if (!d[k] || d[k].quantity < amt) {
            _pushMessage?.(`⚠ Cannot afford ${upg.label} — need more ${k}.`, 'warning');
            return;
        }
    }
    for (const [k, amt] of upg.cost) {
        d[k].quantity -= amt;
        _updateDisplay(k);
    }
    _owned[id] = true;
    _renderUpgradesBar();
    _pushMessage?.(`🤖 KP-7 online. Robot reporting for duty.`, 'milestone');
    _checkPhaseAdvance();
}

// ── Task completion hook ──────────────────────────────────────

export function onTaskComplete() {
    if (!_owned.kp7 || !_allResources) return;
    if (Math.random() >= 0.1) return;           // 10% chance

    const roll = Math.random();

    if (roll < 0.34) {
        // Upgrade a random facility
        const result = _upgradeRandomNode?.();
        if (result) {
            _pushMessage?.(`🤖 KP-7: Upgraded ${result}.`, 'milestone');
        } else {
            _pushMessage?.('🤖 KP-7: All facilities at max level — running diagnostics.', 'info');
        }

    } else if (roll < 0.67) {
        // Deposit a random resource
        const keys = Object.keys(_allResources.dictionnary);
        const key  = keys[Math.floor(Math.random() * keys.length)];
        const res  = _allResources.dictionnary[key];
        const drop = Math.floor(Math.random() * 41) + 10;    // 10–50
        const added = Math.min(drop, res.capacity - res.quantity);
        if (added > 0) {
            res.quantity += added;
            _updateDisplay(key);
            _pushMessage?.(`🤖 KP-7: Deposited ${added}× ${key}.`, 'milestone');
        } else {
            _pushMessage?.(`🤖 KP-7: ${key} storage full — standing by.`, 'info');
        }

    } else {
        // Expand a random inventory slot
        const keys = Object.keys(_allResources.dictionnary);
        const key  = keys[Math.floor(Math.random() * keys.length)];
        const res  = _allResources.dictionnary[key];
        res.capacity *= 2;
        _updateDisplay(key);
        _pushMessage?.(`🤖 KP-7: ${key} capacity expanded to ${res.capacity}.`, 'milestone');
    }
}

// ── Save / Load ───────────────────────────────────────────────

export function save_upgrades() {
    return { owned: { ..._owned }, currentPhase: _currentPhase };
}

export function reset_upgrades() {
    _owned.kp7     = false;
    _owned.conduit = 0;
    _currentPhase  = 0;
    _setConnTransferRate?.(1);
    _renderUpgradesBar();
    _updatePhaseOverlay();
}

export function load_upgrades(data) {
    if (data?.owned) Object.assign(_owned, data.owned);
    if (typeof data?.currentPhase === 'number') _currentPhase = data.currentPhase;
    // Restore conduit transfer rate after load
    const conduitLevel = _owned.conduit || 0;
    if (conduitLevel > 0) {
        const rate = UPGRADE_DEFS.conduit.levels[conduitLevel - 1]?.rate || 1;
        _setConnTransferRate?.(rate);
    }
    _renderUpgradesBar();
    _updatePhaseOverlay();
}

// ── Internal helpers ──────────────────────────────────────────

function _updateDisplay(key) {
    const res = _allResources?.dictionnary[key];
    if (!res) return;
    const el = document.getElementById(key);
    if (el) el.innerHTML = `${Math.round(res.quantity)}/${res.capacity}`;
}