// ============================================================
//  FACTORY NODE GRAPH  v2
//  - Zoom (scroll wheel)
//  - Pan (space + drag, or middle-click drag)
//  - Inventory bar at top of panel
//  - Node levels 1-5 (sidebar arrows + in-place [+] upgrade)
// ============================================================

export const NODE_DEFS = {
    biofuel_burner: {
        label: 'BIOFUEL BURNER',
        icon: '🔥',
        section: 'energy',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty: 50 }, { id: 'Wires', qty:50 }],
        inputs:  [{ id: 'biofuel', label: 'BIOFUEL', color: '#d4a017', rate: 1 }],
        outputs: [{ id: 'energy',  label: 'ENERGY',  color: '#00ff88', rate: 5 }],
        description: 'Biofuel → Energy',
    },
    iron_miner: {
        label: 'IRON MINER',
        icon: '⛏',
        section: 'raw',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty:50 }, { id: 'Wires', qty: 50 }],
        inputs:  [{ id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },],
        outputs: [{ id: 'iron', label: 'IRON', color: '#aaaaaa', rate: 1 }],
        description: 'Consumes 1 iron deposit',
    },
    wood_drone: {
        label: 'WOOD DRONE',
        icon: '🌲',
        section: 'raw',
        cost: [{ id: 'Coils', qty: 50 }, { id: 'Screws', qty: 50 }, { id: 'Wires', qty: 50 }],
        inputs:  [{ id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },],
        outputs: [{ id: 'wood', label: 'WOOD', color: '#8B6914', rate: 2 }],
        description: 'Consumes 1 wood deposit',
    },
    copper_mine: {
        label: 'COPPER MINE',
        icon: '🪨',
        section: 'raw',
        gatedOn: 'copper',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty:50 }, { id: 'Wires', qty: 50 }],
        inputs:  [{ id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },],
        outputs: [{ id: 'copper', label: 'COPPER', color: '#b87333', rate: 1 }],
        description: 'Consumes 1 copper deposit',
    },
    inventory: {
        label: 'INVENTORY',
        icon: '📦',
        section: 'alien',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty:100 }, { id: 'Wires', qty: 100 }],
        inputs:  [{ id: 'inv_in',  label: 'IN',  color: '#aa55ff' }],
        outputs: [{ id: 'inv_out', label: 'OUT', color: '#aa55ff' }],
        capacity: 100,
        description: '50× Iron Plates + 25× Screws — buffer between factories',
    },
    biofuel_refinery: {
        label: 'BIOFUEL REFINERY',
        icon: '⚗',
        section: 'manufacture',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty: 50 }, { id: 'Wires', qty: 50 }],
        inputs:  [{ id: 'wood',    label: 'WOOD',    color: '#8B6914', rate: 5 },
                  { id: 'energy',  label: 'ENERGY',  color: '#00ff88', rate: 1 }],
        outputs: [{ id: 'biofuel', label: 'BIOFUEL', color: '#d4a017', rate: 1 }],
        description: '5 Wood → 1 Biofuel',
    },
    iron_plate_factory: {
        label: 'IRON PLATES',
        icon: '▣',
        section: 'manufacture',
        cost: [{ id: 'Iron Plates', qty: 200 }, { id: 'Screws', qty:50 }, { id: 'Wires', qty: 50 }],
        inputs:  [
            { id: 'iron',   label: 'IRON',   color: '#aaaaaa', rate: 1 },
            { id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },
        ],
        outputs: [{ id: 'iron_plates', label: 'IRON PLATES', color: '#cc8844', rate: 1 }],
        description: 'Iron + Energy → Iron Plates',
    },
    screws_factory: {
        label: 'SCREWS',
        icon: '✦',
        section: 'manufacture',
        cost: [{ id: 'Iron Plates', qty: 50 }, { id: 'Iron', qty: 20 }],
        inputs:  [
            { id: 'iron',   label: 'IRON',   color: '#aaaaaa', rate: 1 },
            { id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },
        ],
        outputs: [{ id: 'screws', label: 'SCREWS', color: '#88aacc', rate: 1 }],
        description: 'Iron + Energy → Screws',
    },
    coils_factory: {
        label: 'COILS',
        icon: '⌀',
        section: 'manufacture',
        gatedOn: 'copper',
        cost: [{ id: 'Iron Plates', qty: 100 }, { id: 'Screws', qty: 30 }],
        inputs:  [
            { id: 'copper', label: 'COPPER', color: '#b87333', rate: 1 },
            { id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },
        ],
        outputs: [{ id: 'coils', label: 'COILS', color: '#dd9944', rate: 1 }],
        description: 'Copper + Energy → Coils',
    },
    wires_factory: {
        label: 'WIRES',
        icon: '〜',
        section: 'manufacture',
        gatedOn: 'copper',
        cost: [{ id: 'Iron Plates', qty: 100 }, { id: 'Screws', qty: 30 }, { id: 'Coils', qty: 10 }],
        inputs:  [
            { id: 'coils',  label: 'COILS',  color: '#dd9944', rate: 1 },
            { id: 'energy', label: 'ENERGY', color: '#00ff88', rate: 1 },
        ],
        outputs: [{ id: 'wires', label: 'WIRES', color: '#cc88ff', rate: 1 }],
        description: 'Coils + Energy → Wires',
    },
};

// ── Router nodes (merger / splitter) ─────────────────────────
export const ROUTER_DEFS = {
    merger: {
        label: 'MERGER',
        icon: '⊕',
        cost: [{ id: 'Screws', qty: 10 }],
        inputs:  [
            { id: 'in_0', label: 'A', color: '#55ddbb', generic: true },
            { id: 'in_1', label: 'B', color: '#55ddbb', generic: true },
            { id: 'in_2', label: 'C', color: '#55ddbb', generic: true },
        ],
        outputs: [{ id: 'out', label: 'OUT', color: '#55ddbb', generic: true }],
        description: 'Merge up to 3 streams, round-robin',
    },
    splitter: {
        label: 'SPLITTER',
        icon: '⊗',
        cost: [{ id: 'Screws', qty: 10 }],
        inputs:  [{ id: 'in', label: 'IN', color: '#55ddbb', generic: true }],
        outputs: [
            { id: 'out_0', label: 'A', color: '#55ddbb', generic: true },
            { id: 'out_1', label: 'B', color: '#55ddbb', generic: true },
            { id: 'out_2', label: 'C', color: '#55ddbb', generic: true },
        ],
        description: 'Split 1 stream into up to 3, round-robin',
    },
};

function _getAnyDef(type) { return NODE_DEFS[type] || ROUTER_DEFS[type] || null; }

// ── Level scaling ─────────────────────────────────────────────
const LEVEL_RATE_MULT     = [1, 1.5, 2, 3, 5];       // rate multiplier per level (index = level-1)
const LEVEL_MAX_OUT_CONN  = [1, 2, 3, 4, 5];          // max outgoing connections per output port
const PLACEMENT_COST_MULT = [1, 2, 5, 10, 20];        // placement cost multiplier per level

// Extra placement costs added at each level (even for free factories)
const LEVEL_PLACE_COST = [
    [],
    [{ id: 'Iron Plates', qty: 5 }],
    [{ id: 'Iron Plates', qty: 15 }, { id: 'Screws', qty: 5 }],
    [{ id: 'Iron Plates', qty: 35 }, { id: 'Screws', qty: 15 }, { id: 'Coils', qty: 5 }],
    [{ id: 'Iron Plates', qty: 75 }, { id: 'Screws', qty: 35 }, { id: 'Coils', qty: 15 }, { id: 'Wires', qty: 10 }],
];

// Cost to upgrade from level N → N+1  (index 0 = L1→L2)
const UPGRADE_COSTS = [
    [{ id: 'Iron Plates', qty: 10 }, { id: 'Screws', qty: 5 }],
    [{ id: 'Iron Plates', qty: 25 }, { id: 'Screws', qty: 15 }, { id: 'Coils', qty: 5 }],
    [{ id: 'Iron Plates', qty: 50 }, { id: 'Screws', qty: 30 }, { id: 'Coils', qty: 15 }, { id: 'Wires', qty: 10 }],
    [{ id: 'Iron Plates', qty: 100 }, { id: 'Screws', qty: 60 }, { id: 'Coils', qty: 30 }, { id: 'Wires', qty: 25 }],
];

// ── Connection transfer rate (units per tick per pipe) ────────
let connTransferRate = 1;

export function setConnTransferRate(n) { connTransferRate = n; }

// ── State ────────────────────────────────────────────────────
let nodes       = [];
let connections = [];
let nextId      = 1;
let _placeFlashTimer = null;

// Viewport transform
let vpX    = 0;
let vpY    = 0;
let vpZoom = 1;

// Pan state
let isPanning   = false;
let panStartX   = 0;
let panStartY   = 0;
let panOriginX  = 0;
let panOriginY  = 0;
let spaceHeld   = false;

// Port-click state
let pendingPort = null;

// Per-type selected placement level in the sidebar
const _sidebarLevel = {};

// Injected from ressources.js
let _allResources   = null;
let _tryProduce     = null;
let _getDeposits    = null;
let _consumeDeposit = null;
let _refundDeposit  = null;
let _getDiscovered  = null;
let _assignPlayer   = null;

// Raw resource node types → deposit key
const RAW_DEPOSIT_KEYS = { iron_miner: 'iron', wood_drone: 'wood', copper_mine: 'copper' };

// ── Init ─────────────────────────────────────────────────────

export function init_factories(allResources, tryProduceFn, getDepositsFn, consumeDepositFn, refundDepositFn, getDiscoveredFn, assignPlayerFn) {
    _allResources   = allResources;
    _tryProduce     = tryProduceFn;
    _getDeposits    = getDepositsFn    || (() => ({}));
    _consumeDeposit = consumeDepositFn || (() => true);
    _refundDeposit  = refundDepositFn  || (() => {});
    _getDiscovered  = getDiscoveredFn  || (() => ({}));
    _assignPlayer   = assignPlayerFn   || null;
    _renderSidebar();
    _initSidebarResize();
    _initCanvas();
    _initZoomPan();
    _renderInventoryBar();
}

function _initSidebarResize() {
    const sidebar = document.getElementById('factory-sidebar');
    if (!sidebar) return;

    const handle = document.createElement('div');
    handle.className = 'fsb-resize-handle';
    sidebar.insertAdjacentElement('afterend', handle);

    let dragging = false;
    let startX, startW;

    handle.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startW = sidebar.getBoundingClientRect().width;
        handle.classList.add('is-dragging');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        sidebar.style.width = Math.max(80, startW + (e.clientX - startX)) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        handle.classList.remove('is-dragging');
        document.body.style.cursor = '';
    });
}

export function refreshDeposits() { _renderSidebar(); _renderInventoryBar(); }

// ── Level helper ──────────────────────────────────────────────

function _getLeveledDef(type, level) {
    if (ROUTER_DEFS[type]) return { ...ROUTER_DEFS[type] };
    const base  = NODE_DEFS[type];
    const mult  = LEVEL_RATE_MULT[level - 1]    || 1;
    const cmult = PLACEMENT_COST_MULT[level - 1] || 1;

    const inputs  = base.inputs.map(p  => ({ ...p, rate: Math.round((p.rate  || 1) * mult) }));
    const outputs = base.outputs.map(p => ({ ...p, rate: Math.round((p.rate  || 1) * mult) }));

    // Merge scaled base cost with the level's extra placement cost
    const scaled  = base.cost.map(c => ({ ...c, qty: Math.max(1, Math.round(c.qty * cmult)) }));
    const extra   = LEVEL_PLACE_COST[level - 1] || [];
    const costMap = {};
    scaled.forEach(c => { costMap[c.id] = { ...c }; });
    extra.forEach(c => {
        costMap[c.id] = costMap[c.id]
            ? { ...costMap[c.id], qty: costMap[c.id].qty + c.qty }
            : { ...c };
    });
    const cost = Object.values(costMap);

    return { ...base, inputs, outputs, cost, maxConns: LEVEL_MAX_OUT_CONN[level - 1] || 1 };
}

// ── Tooltip ───────────────────────────────────────────────────

function _showTooltip(html, e) {
    const tt = document.getElementById('hud-tooltip');
    if (!tt) return;
    tt.innerHTML = html;
    tt.classList.remove('hidden');
    _moveTooltip(e);
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

function _portRateStr(portDef) {
    const rate   = portDef.rate   || 1;
    const period = portDef.period || 1;
    return period === 1 ? `×${rate}/t` : `×${rate}/${period}t`;
}

function _nodeTooltipHtml(def, level, missingIds = []) {
    const missingSet = new Set(missingIds);
    const place = def.cost.length
        ? def.cost.map(c => {
            const cls = missingSet.has(c.id) ? ' class="tt-missing"' : '';
            return `<li${cls}>${c.label || c.id} ×${c.qty}</li>`;
          }).join('')
        : '<li>FREE</li>';
    const ins = def.inputs.length
        ? def.inputs.map(i => `<li>${i.label} ${_portRateStr(i)}</li>`).join('')
        : '<li>—</li>';
    const outs = def.outputs.map(o => `<li>${o.label} ${_portRateStr(o)}</li>`).join('');
    const lvlStr = level
        ? `<div class="tt-title">LEVEL</div><ul><li>L${level}/5 · ≤${LEVEL_MAX_OUT_CONN[level - 1]} out/port</li></ul>`
        : '';
    return `${lvlStr}<div class="tt-title">PLACEMENT COST</div><ul>${place}</ul>` +
           `<div class="tt-title">INPUTS</div><ul>${ins}</ul>` +
           `<div class="tt-title">OUTPUTS</div><ul>${outs}</ul>`;
}

// ── Inventory bar ─────────────────────────────────────────────

const UPGRADE_COST = [
    ['Screws',      100],
    ['Iron Plates', 100],
    ['Coils',       100],
    ['Wires',       100],
];

function _tryUpgradeCapacity(itemKey) {
    const d = _allResources.dictionnary;
    const res = d[itemKey];
    if (!res) return;
    for (const [k, amt] of UPGRADE_COST) {
        if (!d[k] || d[k].quantity < amt) return;
    }
    for (const [k, amt] of UPGRADE_COST) {
        d[k].quantity -= amt;
        _updateResourceDisplay(k, d[k].quantity, d[k].capacity);
    }
    res.capacity *= 2;
    _updateResourceDisplay(itemKey, res.quantity, res.capacity);
}

const INV_ITEMS = [
    { key: 'Energy',      icon: '⚡', id: 'Energy',      assignId: 'assign-energy' },
    { key: 'Iron',        icon: '⬡', id: 'Iron',         assignId: 'assign-iron' },
    { key: 'Wood',        icon: '⬟', id: 'Wood',         assignId: 'assign-wood' },
    { key: 'Biofuel',    icon: '🛢', id: 'Biofuel',      assignId: 'assign-biofuel' },
    { key: 'Copper',      icon: '◈', id: 'Copper',       assignId: 'assign-copper',   gatedOn: 'copper' },
    { key: 'Iron Plates', icon: '▣', id: 'Iron Plates',  assignId: 'assign-iron-plates' },
    { key: 'Screws',      icon: '✦', id: 'Screws',       assignId: 'assign-screws' },
    { key: 'Coils',       icon: '⌀', id: 'Coils',        assignId: 'assign-coils',  gatedOn: 'copper' },
    { key: 'Wires',       icon: '〜', id: 'Wires',        assignId: 'assign-wires',  gatedOn: 'copper' },
];

function _renderInventoryBar() {
    const bar = document.getElementById('factory-inventory-bar');
    if (!bar) return;
    bar.innerHTML = '';
    const discovered = _getDiscovered ? _getDiscovered() : {};
    INV_ITEMS.filter(item => !item.gatedOn || discovered[item.gatedOn]).forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'inv-bar-cell';
        cell.id = item.assignId;
        cell.innerHTML = `<span class="inv-bar-icon">${item.icon}</span><span class="inv-bar-name">${item.key}</span><a class="inv-bar-val" id="${item.id}">0/200</a><button class="inv-bar-upgrade">+</button>`;
        cell.addEventListener('click', () => _assignPlayer?.(item.key));
        cell.addEventListener('mouseenter', (e) => {
            const res = _allResources?.dictionnary[item.key];
            const lines = res?.cost?.length
                ? res.cost.map(([k, a]) => `<li>${k} ×${a}</li>`).join('')
                : '<li>FREE</li>';
            _showTooltip(`<div class="tt-title">COST / TICK</div><ul>${lines}</ul>`, e);
        });
        cell.addEventListener('mousemove', _moveTooltip);
        cell.addEventListener('mouseleave', _hideTooltip);

        const upgradeBtn = cell.querySelector('.inv-bar-upgrade');
        upgradeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            _tryUpgradeCapacity(item.key);
        });
        upgradeBtn.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            const res = _allResources?.dictionnary[item.key];
            const added = res ? res.capacity : '?';
            _showTooltip(
                `<div class="tt-title">UPGRADE CAPACITY</div>` +
                `<ul>${UPGRADE_COST.map(([k, a]) => `<li>${k} ×${a}</li>`).join('')}</ul>` +
                `<div class="tt-title">EFFECT</div><ul><li>+${added} max (doubles to ${added * 2})</li></ul>`,
                e
            );
        });
        upgradeBtn.addEventListener('mousemove', _moveTooltip);
        upgradeBtn.addEventListener('mouseleave', _hideTooltip);

        bar.appendChild(cell);
    });

    // Restore current resource values (cells were just rebuilt with 0/200 placeholder)
    if (_allResources) {
        for (const [name, res] of Object.entries(_allResources.dictionnary)) {
            _updateResourceDisplay(name, res.quantity, res.capacity);
        }
    }
}

// ── Tick ─────────────────────────────────────────────────────

const BUF_CAP = 100;

// Phase 1: move resources between factory buffers along connections.
// Energy bypasses this — it always flows directly to/from the global pool.
function _doConnectionTransfers() {
    connections.forEach(conn => {
        const resKey = _resKey(conn.resourceId);
        if (resKey === 'Energy') return;
        const fromNode = nodes.find(n => n.id === conn.fromNode);
        const toNode   = nodes.find(n => n.id === conn.toNode);
        if (!fromNode || !toNode) return;
        fromNode._outputBuf = fromNode._outputBuf || {};
        toNode._inputBuf    = toNode._inputBuf    || {};
        const avail = fromNode._outputBuf[resKey] || 0;
        const space = BUF_CAP - (toNode._inputBuf[resKey] || 0);
        const xfer  = Math.min(connTransferRate, avail, Math.max(0, space));
        if (xfer > 0) {
            fromNode._outputBuf[resKey] = avail - xfer;
            toNode._inputBuf[resKey]    = (toNode._inputBuf[resKey] || 0) + xfer;
            _flashConnection(conn.id);
        }
    });
}

function _flashConnection(connId) {
    const path = document.getElementById(`conn-${connId}`);
    if (!path) return;
    const color = path.dataset.baseColor || '#00ff88';
    path.style.strokeWidth = '4';
    path.style.opacity     = '1';
    path.style.filter      = `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px ${color})`;
    clearTimeout(path._flashTimer);
    path._flashTimer = setTimeout(() => {
        path.style.strokeWidth = '2';
        path.style.opacity     = '0.8';
        path.style.filter      = `drop-shadow(0 0 3px ${color})`;
    }, 120);
}

export function tickNodeGraph() {
    if (!_allResources) return;
    _doConnectionTransfers();
    const d = _allResources.dictionnary;

    nodes.forEach(node => {
        const level = node.level || 1;
        const def   = _getLeveledDef(node.type, level);
        node.ticks  = (node.ticks || 0) + 1;

        // ── Inventory node: bridge between factory buffers and global pool ──
        if (node.type === 'inventory') {
            node._inputBuf  = node._inputBuf  || {};
            node._outputBuf = node._outputBuf || {};
            let active = false;

            // Drain input buffer → global pool (factory network → inventory bar)
            for (const [key, amt] of Object.entries(node._inputBuf)) {
                if (amt > 0 && d[key]) {
                    const xfer = Math.min(connTransferRate, amt, d[key].capacity - d[key].quantity);
                    if (xfer > 0) {
                        d[key].quantity += xfer;
                        node._inputBuf[key] = amt - xfer;
                        _updateResourceDisplay(key, d[key].quantity, d[key].capacity);
                        active = true;
                    }
                }
            }
            // Fill output buffer ← global pool (inventory bar → factory network)
            connections.filter(c => c.fromNode === node.id).forEach(conn => {
                const key = _resKey(conn.resourceId);
                const buf = node._outputBuf[key] || 0;
                if (buf < BUF_CAP && d[key] && d[key].quantity > 0) {
                    const xfer = Math.min(connTransferRate, d[key].quantity, BUF_CAP - buf);
                    if (xfer > 0) {
                        d[key].quantity -= xfer;
                        node._outputBuf[key] = buf + xfer;
                        _updateResourceDisplay(key, d[key].quantity, d[key].capacity);
                        active = true;
                    }
                }
            });
            _setNodeActive(node.id, active);
            return;
        }

        // ── Merger: round-robin from input buffers → output buffer ──
        if (node.type === 'merger') {
            node._inputBuf  = node._inputBuf  || {};
            node._outputBuf = node._outputBuf || {};
            const ins = connections.filter(c => c.toNode === node.id);
            if (!ins.length) { _setNodeActive(node.id, false); return; }
            node._rrIdx = (node._rrIdx || 0) % ins.length;
            let found = false;
            for (let i = 0; i < ins.length; i++) {
                const idx    = (node._rrIdx + i) % ins.length;
                const resKey = _resKey(ins[idx].resourceId);
                const inAmt  = node._inputBuf[resKey]  || 0;
                const outAmt = node._outputBuf[resKey] || 0;
                if (inAmt > 0 && outAmt < BUF_CAP) {
                    const xfer = Math.min(connTransferRate, inAmt, BUF_CAP - outAmt);
                    node._inputBuf[resKey]  = inAmt - xfer;
                    node._outputBuf[resKey] = outAmt + xfer;
                    node._rrIdx = (idx + 1) % ins.length;
                    found = true;
                    break;
                }
            }
            _setNodeActive(node.id, found);
            return;
        }

        // ── Splitter: input buffer → output buffer, round-robin for display ──
        if (node.type === 'splitter') {
            node._inputBuf  = node._inputBuf  || {};
            node._outputBuf = node._outputBuf || {};
            const ins  = connections.filter(c => c.toNode  === node.id);
            const outs = connections.filter(c => c.fromNode === node.id);
            if (!ins.length || !outs.length) { _setNodeActive(node.id, false); return; }
            const resKey = _resKey(ins[0].resourceId);
            const inAmt  = node._inputBuf[resKey]  || 0;
            const outAmt = node._outputBuf[resKey] || 0;
            if (inAmt > 0 && outAmt < BUF_CAP) {
                const xfer = Math.min(connTransferRate, inAmt, BUF_CAP - outAmt);
                node._inputBuf[resKey]  = inAmt - xfer;
                node._outputBuf[resKey] = outAmt + xfer;
                node._rrIdx = ((node._rrIdx || 0) + 1) % outs.length;
                _setNodeActive(node.id, true);
            } else {
                _setNodeActive(node.id, false);
            }
            return;
        }

        // ── Iron miner: produces directly to its output buffer ──
        if (node.type === 'iron_miner') {
            node._outputBuf = node._outputBuf || {};
            const rate = def.outputs[0]?.rate || 1;
            if ((node._outputBuf['Iron'] || 0) < BUF_CAP) {
                node._outputBuf['Iron'] = Math.min(BUF_CAP, (node._outputBuf['Iron'] || 0) + rate);
                _setNodeActive(node.id, true);
            } else {
                _setNodeActive(node.id, false);
            }
            return;
        }

        // ── Generic factory: buffers only, energy direct to/from global pool ──
        const allConnected = def.inputs.every(inp =>
            inp.id === 'energy' ||
            connections.some(c => c.toNode === node.id && c.toPort === inp.id)
        );
        if (!allConnected) { _setNodeActive(node.id, false); return; }

        node._inputBuf  = node._inputBuf  || {};
        node._outputBuf = node._outputBuf || {};

        const energyInp  = def.inputs.find(i => i.id === 'energy');
        const energyRate = energyInp ? (energyInp.rate || 1) : 0;
        const canFire =
            (!energyRate || (d['Energy'] && d['Energy'].quantity >= energyRate)) &&
            def.inputs.every(inp =>
                inp.id === 'energy' || (node._inputBuf[_resKey(inp.id)] || 0) >= (inp.rate || 1)
            ) &&
            def.outputs.every(out =>
                out.id === 'energy' || (node._outputBuf[_resKey(out.id)] || 0) < BUF_CAP
            );

        if (canFire) {
            if (energyRate) {
                d['Energy'].quantity -= energyRate;
                _updateResourceDisplay('Energy', d['Energy'].quantity, d['Energy'].capacity);
            }
            def.inputs.forEach(inp => {
                if (inp.id === 'energy') return;
                const key = _resKey(inp.id);
                node._inputBuf[key] = (node._inputBuf[key] || 0) - (inp.rate || 1);
            });
            def.outputs.forEach(out => {
                if (out.id === 'energy') {
                    // Energy output goes directly to global pool
                    d['Energy'].quantity = Math.min(d['Energy'].capacity, d['Energy'].quantity + (out.rate || 1));
                    _updateResourceDisplay('Energy', d['Energy'].quantity, d['Energy'].capacity);
                } else {
                    const key = _resKey(out.id);
                    node._outputBuf[key] = Math.min(BUF_CAP, (node._outputBuf[key] || 0) + (out.rate || 1));
                }
            });
        }
        _setNodeActive(node.id, canFire);
    });
}

function _resKey(portId) {
    return { wood:'Wood', energy:'Energy', iron:'Iron', iron_plates:'Iron Plates',
             copper:'Copper', wires:'Wires', coils:'Coils', screws:'Screws',
             biofuel:'Biofuel' }[portId] || portId;
}

function _updateResourceDisplay(key, value, capacity) {
    const el = document.getElementById(key);
    if (el) el.innerHTML = `${Math.round(value)}/${capacity}`;
}

// ── Sidebar ───────────────────────────────────────────────────

const SIDEBAR_SECTIONS = [
    { id: 'raw',         label: 'RAW RESOURCES' },
    { id: 'energy',      label: 'ENERGY'        },
    { id: 'manufacture', label: 'MANUFACTURE'   },
    { id: 'alien',       label: 'ALIEN TECH'    },
];

// Tracks which sections are collapsed
const _sectionCollapsed = { raw: false, energy: false, manufacture: false, alien: false };

function _makeRoutingBar() {
    const bar = document.createElement('div');
    bar.className = 'fsb-routing-bar';
    ['merger', 'splitter'].forEach(type => {
        const def = ROUTER_DEFS[type];
        const btn = document.createElement('button');
        btn.className = 'fsb-routing-btn';
        btn.innerHTML = `<span class="fsb-routing-icon">${def.icon}</span><span class="fsb-routing-label">${def.label}</span>`;

        btn.addEventListener('mouseenter', (e) => {
            const costHtml = def.cost.length
                ? def.cost.map(c => `<li>${c.id} ×${c.qty}</li>`).join('')
                : '<li>FREE</li>';
            _showTooltip(
                `<div class="tt-title">PLACEMENT COST</div><ul>${costHtml}</ul>` +
                `<div class="tt-desc">${def.description}</div>`, e);
        });
        btn.addEventListener('mousemove', _moveTooltip);
        btn.addEventListener('mouseleave', _hideTooltip);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const missing = def.cost
                .filter(c => { const r = _allResources?.dictionnary[c.id]; return !r || r.quantity < c.qty; })
                .map(c => c.id);
            if (missing.length > 0) {
                const ms = new Set(missing);
                const costHtml = def.cost.map(c =>
                    `<li${ms.has(c.id) ? ' class="tt-missing"' : ''}>${c.id} ×${c.qty}</li>`
                ).join('');
                _showTooltip(`<div class="tt-title">PLACEMENT COST</div><ul>${costHtml}</ul>`, e);
                clearTimeout(_placeFlashTimer);
                _placeFlashTimer = setTimeout(_hideTooltip, 1500);
                return;
            }
            _placeNode(type, 1);
        });
        bar.appendChild(btn);
    });
    return bar;
}

function _renderSidebar() {
    const sidebar = document.getElementById('factory-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';

    sidebar.appendChild(_makeRoutingBar());

    SIDEBAR_SECTIONS.forEach(({ id: sectionId, label }) => {
        // Section header
        const header = document.createElement('div');
        header.className = 'fsb-section-header';
        header.innerHTML =
            `<span class="fsb-section-arrow">${_sectionCollapsed[sectionId] ? '▶' : '▼'}</span>` +
            `<span class="fsb-section-label">${label}</span>`;
        header.addEventListener('click', () => {
            _sectionCollapsed[sectionId] = !_sectionCollapsed[sectionId];
            _renderSidebar();
        });
        sidebar.appendChild(header);

        if (_sectionCollapsed[sectionId]) return;

        // Items belonging to this section (hide gated types until discovered)
        const discovered = _getDiscovered ? _getDiscovered() : {};
        const types = Object.entries(NODE_DEFS).filter(([, def]) =>
            def.section === sectionId && (!def.gatedOn || discovered[def.gatedOn])
        );

        if (types.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'fsb-section-empty';
            empty.textContent = '— NONE —';
            sidebar.appendChild(empty);
            return;
        }

        types.forEach(([type]) => {
            _sidebarLevel[type] = _sidebarLevel[type] || 1;
            const item = document.createElement('div');
            item.className = 'factory-sidebar-item';
            item.dataset.type = type;

            item.addEventListener('mouseenter', (e) => {
                const lvl = _sidebarLevel[type] || 1;
                _showTooltip(_nodeTooltipHtml(_getLeveledDef(type, lvl), lvl), e);
            });
            item.addEventListener('mousemove', _moveTooltip);
            item.addEventListener('mouseleave', _hideTooltip);

            sidebar.appendChild(item);
            _renderSidebarItem(item, type);
        });
    });
}

function _renderSidebarItem(container, type) {
    const def        = NODE_DEFS[type];
    const level      = _sidebarLevel[type] || 1;
    const depositKey = RAW_DEPOSIT_KEYS[type];
    let depositBadge = '';
    let noDeposit    = false;
    if (depositKey !== undefined) {
        const count = (_getDeposits()[depositKey] || 0);
        noDeposit   = count <= 0;
        depositBadge = `<span class="fsb-deposit ${noDeposit ? 'fsb-deposit-empty' : ''}">${count}</span>`;
    }

    container.innerHTML = `
        <span class="fsb-icon">${def.icon}</span>
        <div class="fsb-info">
            <span class="fsb-label">${def.label} ${depositBadge}</span>
            <span class="fsb-desc">${def.description}</span>
        </div>
        <div class="fsb-controls">
            <div class="fsb-level-ctrl">
                <button class="fsb-lvl-btn fsb-lvl-dn" ${level <= 1 ? 'disabled' : ''}>◀</button>
                <span class="fsb-lvl-badge">L${level}</span>
                <button class="fsb-lvl-btn fsb-lvl-up" ${level >= 5 ? 'disabled' : ''}>▶</button>
            </div>
            <button class="fsb-place-btn" ${noDeposit ? 'disabled' : ''}>PLACE</button>
        </div>`;

    container.querySelector('.fsb-lvl-dn').addEventListener('click', e => {
        e.stopPropagation();
        if (_sidebarLevel[type] > 1) {
            _sidebarLevel[type]--;
            _renderSidebarItem(container, type);
            const lvl = _sidebarLevel[type];
            _showTooltip(_nodeTooltipHtml(_getLeveledDef(type, lvl), lvl), e);
        }
    });
    container.querySelector('.fsb-lvl-up').addEventListener('click', e => {
        e.stopPropagation();
        if (_sidebarLevel[type] < 5) {
            _sidebarLevel[type]++;
            _renderSidebarItem(container, type);
            const lvl = _sidebarLevel[type];
            _showTooltip(_nodeTooltipHtml(_getLeveledDef(type, lvl), lvl), e);
        }
    });
    container.querySelector('.fsb-place-btn').addEventListener('click', (e) => {
        const lvl  = _sidebarLevel[type];
        const ldef = _getLeveledDef(type, lvl);
        const missing = ldef.cost
            .filter(c => {
                const res = _allResources?.dictionnary[c.id];
                return !res || res.quantity < c.qty;
            })
            .map(c => c.id);
        if (missing.length > 0) {
            _showTooltip(_nodeTooltipHtml(ldef, lvl, missing), e);
            clearTimeout(_placeFlashTimer);
            _placeFlashTimer = setTimeout(_hideTooltip, 1500);
            return;
        }
        _placeNode(type, lvl);
    });
}

// ── Canvas & viewport container ───────────────────────────────

function _initCanvas() {
    const canvas = document.getElementById('factory-canvas');
    if (!canvas) return;

    let world = document.getElementById('factory-world');
    if (!world) {
        world = document.createElement('div');
        world.id = 'factory-world';
        canvas.appendChild(world);
    }

    let svg = document.getElementById('factory-svg');
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'factory-svg';
        svg.style.cssText = 'position:absolute;top:0;left:0;width:4000px;height:4000px;pointer-events:none;overflow:visible;';
        world.appendChild(svg);
    }

    _applyTransform();
}

function _applyTransform() {
    const world = document.getElementById('factory-world');
    if (world) {
        world.style.transform = `translate(${vpX}px, ${vpY}px) scale(${vpZoom})`;
        world.style.transformOrigin = '0 0';
    }
}

// ── Zoom & Pan ────────────────────────────────────────────────

function _initZoomPan() {
    const canvas = document.getElementById('factory-canvas');
    if (!canvas) return;

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect   = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta   = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(3, Math.max(0.2, vpZoom * delta));

        vpX = mouseX - (mouseX - vpX) * (newZoom / vpZoom);
        vpY = mouseY - (mouseY - vpY) * (newZoom / vpZoom);
        vpZoom = newZoom;

        _applyTransform();
        _redrawAllConnections();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            spaceHeld = true;
            canvas.style.cursor = 'grab';
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spaceHeld = false;
            canvas.style.cursor = '';
            isPanning = false;
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        if (spaceHeld || e.button === 1) {
            e.preventDefault();
            isPanning  = true;
            panStartX  = e.clientX;
            panStartY  = e.clientY;
            panOriginX = vpX;
            panOriginY = vpY;
            canvas.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        vpX = panOriginX + (e.clientX - panStartX);
        vpY = panOriginY + (e.clientY - panStartY);
        _applyTransform();
        _redrawAllConnections();
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = spaceHeld ? 'grab' : '';
        }
    });

    canvas.addEventListener('click', (e) => {
        if (e.target === canvas || e.target === document.getElementById('factory-world')) {
            _cancelPending();
        }
    });
}

export function init_canvas_cancel() {
    // kept for API compatibility — logic now inside _initZoomPan
}

// ── Place node ────────────────────────────────────────────────

function _placeNode(type, level = 1) {
    const ldef = _getLeveledDef(type, level);

    // Check / consume deposit for raw resource nodes
    const depositKey = RAW_DEPOSIT_KEYS[type];
    if (depositKey !== undefined) {
        const dep = _getDeposits();
        if ((dep[depositKey] || 0) <= 0) return;  // no deposits left
        _consumeDeposit(depositKey);
        _renderSidebar();
    }

    for (const c of ldef.cost) {
        const res = _allResources && _allResources.dictionnary[c.id];
        if (res && res.quantity < c.qty) return;
    }
    for (const c of ldef.cost) {
        const res = _allResources && _allResources.dictionnary[c.id];
        if (res) {
            res.quantity -= c.qty;
            _updateResourceDisplay(c.id, res.quantity, res.capacity);
        }
    }

    const canvas = document.getElementById('factory-canvas');
    const rect   = canvas.getBoundingClientRect();
    const cx     = (rect.width  / 2 - vpX) / vpZoom;
    const cy     = (rect.height / 2 - vpY) / vpZoom;
    const offset = nodes.length * 20;

    const node = { id: nextId++, type, level, x: cx + offset, y: cy + offset, active: false };
    nodes.push(node);
    _renderNode(node);
}

// ── Upgrade node ──────────────────────────────────────────────

// Called by KP-7 robot: upgrades a random non-max-level node for free.
// Returns a description string on success, null if nothing to upgrade.
export function upgradeRandomNode() {
    const upgradeable = nodes.filter(n => !ROUTER_DEFS[n.type] && (n.level || 1) < 5);
    if (upgradeable.length === 0) return null;
    const node  = upgradeable[Math.floor(Math.random() * upgradeable.length)];
    const label = _getAnyDef(node.type)?.label || node.type;
    node.level  = (node.level || 1) + 1;
    const el = document.getElementById(`node-${node.id}`);
    if (el) el.remove();
    _renderNode(node);
    _redrawAllConnections();
    return `${label} → L${node.level}`;
}

function _upgradeNode(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || (node.level || 1) >= 5) return;

    const level = node.level || 1;
    const costs = UPGRADE_COSTS[level - 1];
    const d     = _allResources.dictionnary;

    for (const c of costs) {
        if (!d[c.id] || d[c.id].quantity < c.qty) return;
    }
    for (const c of costs) {
        d[c.id].quantity -= c.qty;
        _updateResourceDisplay(c.id, d[c.id].quantity, d[c.id].capacity);
    }

    node.level = level + 1;

    const el = document.getElementById(`node-${node.id}`);
    if (el) el.remove();
    _renderNode(node);
    _redrawAllConnections();
}

// ── Render node ───────────────────────────────────────────────

function _renderNode(node) {
    const world   = document.getElementById('factory-world');
    const level   = node.level || 1;
    const baseDef  = _getAnyDef(node.type);
    const def      = _getLeveledDef(node.type, level);
    const isRouter = !!ROUTER_DEFS[node.type];

    const el = document.createElement('div');
    el.className = 'factory-node';
    el.id = `node-${node.id}`;
    el.style.left = node.x + 'px';
    el.style.top  = node.y + 'px';

    // Header
    const header = document.createElement('div');
    header.className = 'fn-header';
    header.innerHTML = `
        <span class="fn-icon">${baseDef.icon}</span>
        <span class="fn-label">${baseDef.label}</span>
        ${isRouter ? '' : `<span class="fn-level-badge">L${level}</span>`}
        <button class="fn-delete">✕</button>`;
    el.appendChild(header);

    // Ports
    const ports = document.createElement('div');
    ports.className = 'fn-ports';

    const inCol = document.createElement('div');
    inCol.className = 'fn-port-col fn-inputs';
    def.inputs.filter(inp => inp.id !== 'energy').forEach(inp => inCol.appendChild(_makePort(node, 'input', inp)));
    ports.appendChild(inCol);

    const status = document.createElement('div');
    status.className = 'fn-status fn-status-inactive';
    status.id = `node-status-${node.id}`;
    ports.appendChild(status);

    const outCol = document.createElement('div');
    outCol.className = 'fn-port-col fn-outputs';
    def.outputs.filter(out => out.id !== 'energy').forEach(out => outCol.appendChild(_makePort(node, 'output', out)));
    ports.appendChild(outCol);

    el.appendChild(ports);

    // Footer with upgrade button (only for non-router nodes below max level)
    if (!isRouter && level < 5) {
        const footer = document.createElement('div');
        footer.className = 'fn-footer';

        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'fn-upgrade-btn';
        upgradeBtn.textContent = '[+]';

        upgradeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            _upgradeNode(node.id);
        });
        upgradeBtn.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            const costs    = UPGRADE_COSTS[level - 1];
            const nextMult = LEVEL_RATE_MULT[level];
            const costHtml = costs.map(c => `<li>${c.id} ×${c.qty}</li>`).join('');
            _showTooltip(
                `<div class="tt-title">UPGRADE TO L${level + 1}</div><ul>${costHtml}</ul>` +
                `<div class="tt-title">EFFECT</div><ul>` +
                `<li>rate ×${nextMult} (was ×${LEVEL_RATE_MULT[level - 1]})</li>` +
                `<li>≤${LEVEL_MAX_OUT_CONN[level]} out/port (was ≤${LEVEL_MAX_OUT_CONN[level - 1]})</li>` +
                `</ul>`,
                e
            );
        });
        upgradeBtn.addEventListener('mousemove', _moveTooltip);
        upgradeBtn.addEventListener('mouseleave', _hideTooltip);

        footer.appendChild(upgradeBtn);
        el.appendChild(footer);
    }

    world.appendChild(el);

    header.querySelector('.fn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        _deleteNode(node.id);
    });
    header.addEventListener('mouseenter', (e) => _showTooltip(_nodeTooltipHtml(def, level), e));
    header.addEventListener('mousemove', _moveTooltip);
    header.addEventListener('mouseleave', _hideTooltip);
    _makeDraggable(el, node);
}

function _makePort(node, side, portDef) {
    const wrap = document.createElement('div');
    wrap.className = 'fn-port-wrap';

    const dot = document.createElement('div');
    dot.className = `fn-port fn-port-${side}`;
    dot.style.borderColor = portDef.color;
    dot.dataset.nodeId = node.id;
    dot.dataset.side   = side;
    dot.dataset.portId = portDef.id;
    dot.dataset.color  = portDef.color;
    dot.title = portDef.label;

    const label = document.createElement('span');
    label.className = 'fn-port-label';
    const rateText = portDef.rate !== undefined || portDef.period !== undefined
        ? `<span class="fn-port-rate">${_portRateStr(portDef)}</span>` : '';
    label.innerHTML = `${portDef.label}${rateText ? '<br>' + rateText : ''}`;

    if (side === 'input') { wrap.appendChild(dot); wrap.appendChild(label); }
    else                  { wrap.appendChild(label); wrap.appendChild(dot); }

    dot.addEventListener('click', (e) => { e.stopPropagation(); _handlePortClick(dot, node, side, portDef); });
    return wrap;
}

// ── Port connection logic ─────────────────────────────────────

function _handlePortClick(dot, node, side, portDef) {
    if (!pendingPort) {
        if (side !== 'output') return;
        pendingPort = { nodeId: node.id, portId: portDef.id, resourceId: portDef.id, dot, generic: !!portDef.generic };
        dot.classList.add('fn-port-pending');
        _showTempLine(dot);
        return;
    }
    if (side !== 'input')               { _cancelPending(); return; }
    if (pendingPort.nodeId === node.id) { _cancelPending(); return; }
    if (connections.find(c => c.toNode === node.id && c.toPort === portDef.id)) { _cancelPending(); return; }

    // Enforce max outgoing connections per output port based on source node's level
    const srcNode   = nodes.find(n => n.id === pendingPort.nodeId);
    const srcLevel  = srcNode ? (srcNode.level || 1) : 1;
    const maxConns  = LEVEL_MAX_OUT_CONN[srcLevel - 1] || 1;
    const outCount  = connections.filter(c => c.fromNode === pendingPort.nodeId && c.fromPort === pendingPort.portId).length;
    if (outCount >= maxConns) { _flashError(dot); _cancelPending(); return; }

    const fromIsInventory = pendingPort.portId === 'inv_out';
    const toIsInventory   = portDef.id === 'inv_in';
    if (!fromIsInventory && !toIsInventory && !pendingPort.generic && !portDef.generic
        && pendingPort.resourceId !== portDef.id) {
        _flashError(dot); _cancelPending(); return;
    }
    const resourceId = (toIsInventory || portDef.generic) ? pendingPort.resourceId : portDef.id;

    const conn = { id: nextId++, fromNode: pendingPort.nodeId, fromPort: pendingPort.portId,
                   toNode: node.id, toPort: portDef.id, resourceId };
    connections.push(conn);
    _drawConnection(conn);
    _cancelPending();
}

function _cancelPending() {
    if (pendingPort) {
        pendingPort.dot.classList.remove('fn-port-pending');
        _removeTempLine();
        pendingPort = null;
    }
}

function _flashError(dot) {
    dot.classList.add('fn-port-error');
    setTimeout(() => dot.classList.remove('fn-port-error'), 600);
}

// ── SVG lines ─────────────────────────────────────────────────

function _getPortCenterWorld(dot) {
    const world  = document.getElementById('factory-world');
    const dRect  = dot.getBoundingClientRect();
    const wRect  = world.getBoundingClientRect();
    return {
        x: (dRect.left + dRect.width  / 2 - wRect.left) / vpZoom,
        y: (dRect.top  + dRect.height / 2 - wRect.top)  / vpZoom,
    };
}

function _drawConnection(conn) {
    const fromDot = document.querySelector(`.fn-port[data-node-id="${conn.fromNode}"][data-port-id="${conn.fromPort}"][data-side="output"]`);
    const toDot   = document.querySelector(`.fn-port[data-node-id="${conn.toNode}"][data-port-id="${conn.toPort}"][data-side="input"]`);
    if (!fromDot || !toDot) return;

    const svg   = document.getElementById('factory-svg');
    const color = fromDot.dataset.color || '#00ff88';
    const p1    = _getPortCenterWorld(fromDot);
    const p2    = _getPortCenterWorld(toDot);
    const cp    = Math.abs(p2.x - p1.x) * 0.5;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = `conn-${conn.id}`;
    path.setAttribute('d', `M${p1.x},${p1.y} C${p1.x+cp},${p1.y} ${p2.x-cp},${p2.y} ${p2.x},${p2.y}`);
    path.setAttribute('stroke', color);
    path.setAttribute('fill', 'none');
    path.style.strokeWidth  = '2';
    path.style.opacity      = '0.8';
    path.style.filter       = `drop-shadow(0 0 3px ${color})`;
    path.style.transition   = 'stroke-width 0.45s ease, opacity 0.45s ease, filter 0.45s ease';
    path.dataset.baseColor  = color;
    path.style.pointerEvents = 'stroke';
    path.style.cursor = 'pointer';
    path.addEventListener('click', () => _deleteConnection(conn.id));

    path.addEventListener('mouseenter', (e) => {
        const srcNode  = nodes.find(n => n.id === conn.fromNode);
        const dstNode  = nodes.find(n => n.id === conn.toNode);
        const srcLabel = srcNode ? (_getAnyDef(srcNode.type)?.label || srcNode.type) : '?';
        const dstLabel = dstNode ? (_getAnyDef(dstNode.type)?.label || dstNode.type) : '?';
        const resName  = _resKey(conn.resourceId);
        _showTooltip(
            `<div class="tt-title">PIPE</div>` +
            `<ul>` +
            `<li>${srcLabel} → ${dstLabel}</li>` +
            `<li>Resource: <b>${resName}</b></li>` +
            `<li>Rate: ×${connTransferRate}/t</li>` +
            `</ul>` +
            `<div class="tt-title">CLICK TO DELETE</div>`,
            e
        );
    });
    path.addEventListener('mousemove', _moveTooltip);
    path.addEventListener('mouseleave', _hideTooltip);

    svg.appendChild(path);
}

function _redrawAllConnections() {
    const svg = document.getElementById('factory-svg');
    if (!svg) return;
    svg.querySelectorAll('path:not(#temp-line)').forEach(p => p.remove());
    connections.forEach(c => _drawConnection(c));
}

function _showTempLine(fromDot) {
    const svg   = document.getElementById('factory-svg');
    const world = document.getElementById('factory-world');
    const p1    = _getPortCenterWorld(fromDot);
    const color = fromDot.dataset.color || '#00ff88';
    const canvas = document.getElementById('factory-canvas');

    let line = document.getElementById('temp-line');
    if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.id = 'temp-line';
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '6,4');
        line.setAttribute('fill', 'none');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
    }

    const onMove = (e) => {
        const wRect = world.getBoundingClientRect();
        const mx = (e.clientX - wRect.left) / vpZoom;
        const my = (e.clientY - wRect.top)  / vpZoom;
        const cp = Math.abs(mx - p1.x) * 0.5;
        line.setAttribute('d', `M${p1.x},${p1.y} C${p1.x+cp},${p1.y} ${mx-cp},${my} ${mx},${my}`);
    };
    canvas._tempMoveHandler = onMove;
    canvas.addEventListener('mousemove', onMove);
}

function _removeTempLine() {
    const canvas = document.getElementById('factory-canvas');
    const line   = document.getElementById('temp-line');
    if (line) line.remove();
    if (canvas && canvas._tempMoveHandler) {
        canvas.removeEventListener('mousemove', canvas._tempMoveHandler);
        canvas._tempMoveHandler = null;
    }
}

// ── Delete ────────────────────────────────────────────────────

function _deleteNode(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    const depositKey = node ? RAW_DEPOSIT_KEYS[node.type] : undefined;

    // Refund buffer contents back to the global pool
    if (node && _allResources) {
        const d = _allResources.dictionnary;
        [node._inputBuf, node._outputBuf].forEach(buf => {
            if (!buf) return;
            for (const [key, amt] of Object.entries(buf)) {
                const res = d[key];
                if (res && amt > 0) {
                    res.quantity = Math.min(res.capacity, res.quantity + amt);
                    _updateResourceDisplay(key, res.quantity, res.capacity);
                }
            }
        });
    }

    connections.filter(c => c.fromNode === nodeId || c.toNode === nodeId)
               .forEach(c => _deleteConnection(c.id, true));
    nodes = nodes.filter(n => n.id !== nodeId);
    const el = document.getElementById(`node-${nodeId}`);
    if (el) el.remove();
    _redrawAllConnections();

    if (depositKey !== undefined) {
        _refundDeposit(depositKey);
        _renderSidebar();
    }
}

function _deleteConnection(connId, skipRedraw = false) {
    connections = connections.filter(c => c.id !== connId);
    const path = document.getElementById(`conn-${connId}`);
    if (path) path.remove();
    if (!skipRedraw) _redrawAllConnections();
}

// ── Node active state ─────────────────────────────────────────

function _setNodeActive(nodeId, active) {
    const dot = document.getElementById(`node-status-${nodeId}`);
    if (!dot) return;
    dot.className = `fn-status ${active ? 'fn-status-active' : 'fn-status-inactive'}`;
    dot.title = active ? 'running' : 'inactive / missing inputs';
}

// ── Drag nodes ────────────────────────────────────────────────

function _makeDraggable(el, node) {
    let dragging = false, startX, startY, origX, origY;

    el.addEventListener('mousedown', (e) => {
        if (spaceHeld || isPanning) return;
        if (e.target.closest('.fn-port, .fn-delete, .fn-upgrade-btn')) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        origX = node.x;     origY = node.y;
        el.style.zIndex = 100;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        node.x = origX + (e.clientX - startX) / vpZoom;
        node.y = origY + (e.clientY - startY) / vpZoom;
        el.style.left = node.x + 'px';
        el.style.top  = node.y + 'px';
        _redrawAllConnections();
    });

    document.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; el.style.zIndex = ''; }
    });
}

// ── Reset ─────────────────────────────────────────────────────

export function resetFactory() {
    _cancelPending();

    // Remove all node DOM elements
    const world = document.getElementById('factory-world');
    if (world) world.querySelectorAll('.factory-node').forEach(n => n.remove());

    // Clear SVG connections
    const svg = document.getElementById('factory-svg');
    if (svg) svg.innerHTML = '';

    nodes       = [];
    connections = [];
    nextId      = 1;

    // Reset sidebar levels to 1
    Object.keys(_sidebarLevel).forEach(k => { _sidebarLevel[k] = 1; });
    _renderSidebar();

    // Reset viewport
    vpX = 0; vpY = 0; vpZoom = 1;
    _applyTransform();
}

// ── Save / Load ───────────────────────────────────────────────

export function save_factories() {
    return { nodes, connections, nextId, vpX, vpY, vpZoom };
}

export function load_factories(data) {
    if (!data) return;
    nodes = []; connections = [];
    nextId = data.nextId || 1;
    vpX    = data.vpX    || 0;
    vpY    = data.vpY    || 0;
    vpZoom = data.vpZoom || 1;

    const world = document.getElementById('factory-world');
    if (world) world.querySelectorAll('.factory-node').forEach(n => n.remove());
    const svg = document.getElementById('factory-svg');
    if (svg) svg.innerHTML = '';

    _applyTransform();
    data.nodes.forEach(n => {
        nodes.push(n);
        _renderNode(n);
    });
    data.connections.forEach(c => { connections.push(c); _drawConnection(c); });
}