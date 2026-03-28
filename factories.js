// ============================================================
//  FACTORY NODE GRAPH  v2
//  - Zoom (scroll wheel)
//  - Pan (space + drag, or middle-click drag)
//  - Inventory bar at top of panel
// ============================================================

export const NODE_DEFS = {
    biofuel_burner: {
        label: 'BIOFUEL BURNER',
        icon: '🔥',
        cost: [],
        inputs:  [{ id: 'wood',   label: 'WOOD',   color: '#8B6914' }],
        outputs: [{ id: 'energy', label: 'ENERGY', color: '#00ff88' }],
        rate: 1,
        description: 'Wood → Energy',
    },
    iron_miner: {
        label: 'IRON MINER',
        icon: '⛏',
        cost: [{ id: 'iron_node', label: 'Iron Node', qty: 1 }],
        inputs:  [],
        outputs: [{ id: 'iron', label: 'IRON', color: '#aaaaaa' }],
        rate: 1,
        description: 'Free → Iron (needs Iron Node)',
    },
    iron_plate_factory: {
        label: 'IRON PLATES',
        icon: '▣',
        cost: [],
        inputs:  [
            { id: 'iron',   label: 'IRON',   color: '#aaaaaa' },
            { id: 'energy', label: 'ENERGY', color: '#00ff88' },
        ],
        outputs: [{ id: 'iron_plates', label: 'IRON PLATES', color: '#cc8844' }],
        rate: 1,
        description: 'Iron + Energy → Iron Plates',
    },
};

// ── State ────────────────────────────────────────────────────
let nodes       = [];
let connections = [];
let nextId      = 1;

// Viewport transform
let vpX    = 0;     // pan offset X
let vpY    = 0;     // pan offset Y
let vpZoom = 1;     // zoom scale

// Pan state
let isPanning   = false;
let panStartX   = 0;
let panStartY   = 0;
let panOriginX  = 0;
let panOriginY  = 0;
let spaceHeld   = false;

// Port-click state
let pendingPort = null;

// Injected from ressources.js
let _allResources = null;

// ── Init ─────────────────────────────────────────────────────

export function init_factories(allResources) {
    _allResources = allResources;
    _renderSidebar();
    _initCanvas();
    _initZoomPan();
    _renderInventoryBar();
}

// ── Inventory bar ─────────────────────────────────────────────

const INV_ITEMS = [
    { key: 'Energy',      icon: '⚡', id: 'Energy' },
    { key: 'Iron',        icon: '⬡', id: 'Iron' },
    { key: 'Copper',      icon: '◈', id: 'Copper' },
    { key: 'Wood',        icon: '⬟', id: 'Wood' },
    { key: 'Iron Plates', icon: '▣', id: 'Iron Plates' },
    { key: 'Screws',      icon: '✦', id: 'Screws' },
    { key: 'Coils',       icon: '⌀', id: 'Coils' },
    { key: 'Wires',       icon: '〜', id: 'Wires' },
];

function _renderInventoryBar() {
    const bar = document.getElementById('factory-inventory-bar');
    if (!bar) return;
    bar.innerHTML = '';
    INV_ITEMS.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'inv-bar-cell';
        cell.innerHTML = `<span class="inv-bar-icon">${item.icon}</span><span class="inv-bar-name">${item.key}</span><a class="inv-bar-val" id="${item.id}">0/200</a>`;
        bar.appendChild(cell);
    });
}

// ── Tick ─────────────────────────────────────────────────────

export function tickNodeGraph() {
    if (!_allResources) return;
    nodes.forEach(node => {
        const def = NODE_DEFS[node.type];
        if (!def) return;

        if (node.type === 'iron_miner') {
            const res = _allResources.dictionnary['Iron'];
            if (res) {
                res.quantity = Math.min(res.quantity + def.rate, res.capacity);
                _updateResourceDisplay('Iron', res.quantity, res.capacity);
            }
            _setNodeActive(node.id, true);
            return;
        }

        const allConnected = def.inputs.every(inp =>
            connections.some(c => c.toNode === node.id && c.toPort === inp.id)
        );
        if (!allConnected) { _setNodeActive(node.id, false); return; }

        let canRun = true;
        def.inputs.forEach(inp => {
            const res = _allResources.dictionnary[_resKey(inp.id)];
            if (!res || res.quantity < def.rate) canRun = false;
        });
        if (!canRun) { _setNodeActive(node.id, false); return; }

        def.inputs.forEach(inp => {
            const k = _resKey(inp.id);
            _allResources.dictionnary[k].quantity -= def.rate;
            _updateResourceDisplay(k, _allResources.dictionnary[k].quantity, _allResources.dictionnary[k].capacity);
        });
        def.outputs.forEach(out => {
            const k = _resKey(out.id);
            const res = _allResources.dictionnary[k];
            if (res) {
                res.quantity = Math.min(res.quantity + def.rate, res.capacity);
                _updateResourceDisplay(k, res.quantity, res.capacity);
            }
        });
        _setNodeActive(node.id, true);
    });
}

function _resKey(portId) {
    return { wood:'Wood', energy:'Energy', iron:'Iron', iron_plates:'Iron Plates',
             copper:'Copper', wires:'Wires', coils:'Coils', screws:'Screws' }[portId] || portId;
}

function _updateResourceDisplay(key, value, capacity) {
    const el = document.getElementById(key);
    if (el) el.innerHTML = `${Math.round(value)}/${capacity}`;
}

// ── Sidebar ───────────────────────────────────────────────────

function _renderSidebar() {
    const sidebar = document.getElementById('factory-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    Object.entries(NODE_DEFS).forEach(([type, def]) => {
        const item = document.createElement('div');
        item.className = 'factory-sidebar-item';
        item.innerHTML = `
            <span class="fsb-icon">${def.icon}</span>
            <div class="fsb-info">
                <span class="fsb-label">${def.label}</span>
                <span class="fsb-desc">${def.description}</span>
            </div>
            <button class="fsb-place-btn" data-type="${type}">PLACE</button>`;
        item.querySelector('.fsb-place-btn').addEventListener('click', () => _placeNode(type));
        sidebar.appendChild(item);
    });
}

// ── Canvas & viewport container ───────────────────────────────

function _initCanvas() {
    const canvas = document.getElementById('factory-canvas');
    if (!canvas) return;

    // Inner world — all nodes & SVG live inside this, gets CSS transform applied
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

    // Scroll to zoom — zoom toward cursor position
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect   = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta   = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(3, Math.max(0.2, vpZoom * delta));

        // Adjust pan so zoom centers on mouse position
        vpX = mouseX - (mouseX - vpX) * (newZoom / vpZoom);
        vpY = mouseY - (mouseY - vpY) * (newZoom / vpZoom);
        vpZoom = newZoom;

        _applyTransform();
        _redrawAllConnections();
    }, { passive: false });

    // Space key held = pan mode
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

    // Space+drag or middle-click drag to pan
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

    document.addEventListener('mouseup', (e) => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = spaceHeld ? 'grab' : '';
        }
    });

    // Cancel pending port connection on bare canvas click
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

function _placeNode(type) {
    const def = NODE_DEFS[type];
    if (def.cost.length > 0) {
        for (const c of def.cost) {
            if (c.id === 'iron_node') {
                console.warn('Iron Node cost stub — exploration system pending');
            }
        }
    }
    // Place in center of current viewport
    const canvas = document.getElementById('factory-canvas');
    const rect   = canvas.getBoundingClientRect();
    const cx     = (rect.width  / 2 - vpX) / vpZoom;
    const cy     = (rect.height / 2 - vpY) / vpZoom;
    const offset = nodes.length * 20;

    const node = { id: nextId++, type, x: cx + offset, y: cy + offset, active: false };
    nodes.push(node);
    _renderNode(node);
}

// ── Render node ───────────────────────────────────────────────

function _renderNode(node) {
    const world = document.getElementById('factory-world');
    const def   = NODE_DEFS[node.type];

    const el = document.createElement('div');
    el.className = 'factory-node';
    el.id = `node-${node.id}`;
    el.style.left = node.x + 'px';
    el.style.top  = node.y + 'px';

    const header = document.createElement('div');
    header.className = 'fn-header';
    header.innerHTML = `<span class="fn-icon">${def.icon}</span><span class="fn-label">${def.label}</span><button class="fn-delete">✕</button>`;
    el.appendChild(header);

    const ports = document.createElement('div');
    ports.className = 'fn-ports';

    const inCol = document.createElement('div');
    inCol.className = 'fn-port-col fn-inputs';
    def.inputs.forEach(inp => inCol.appendChild(_makePort(node, 'input', inp)));
    ports.appendChild(inCol);

    const status = document.createElement('div');
    status.className = 'fn-status fn-status-inactive';
    status.id = `node-status-${node.id}`;
    ports.appendChild(status);

    const outCol = document.createElement('div');
    outCol.className = 'fn-port-col fn-outputs';
    def.outputs.forEach(out => outCol.appendChild(_makePort(node, 'output', out)));
    ports.appendChild(outCol);

    el.appendChild(ports);
    world.appendChild(el);

    header.querySelector('.fn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        _deleteNode(node.id);
    });
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
    label.textContent = portDef.label;

    if (side === 'input') { wrap.appendChild(dot); wrap.appendChild(label); }
    else                  { wrap.appendChild(label); wrap.appendChild(dot); }

    dot.addEventListener('click', (e) => { e.stopPropagation(); _handlePortClick(dot, node, side, portDef); });
    return wrap;
}

// ── Port connection logic ─────────────────────────────────────

function _handlePortClick(dot, node, side, portDef) {
    if (!pendingPort) {
        if (side !== 'output') return;
        pendingPort = { nodeId: node.id, portId: portDef.id, resourceId: portDef.id, dot };
        dot.classList.add('fn-port-pending');
        _showTempLine(dot);
        return;
    }
    if (side !== 'input')                      { _cancelPending(); return; }
    if (pendingPort.resourceId !== portDef.id) { _flashError(dot); _cancelPending(); return; }
    if (pendingPort.nodeId === node.id)         { _cancelPending(); return; }
    if (connections.find(c => c.toNode === node.id && c.toPort === portDef.id)) { _cancelPending(); return; }

    const conn = { id: nextId++, fromNode: pendingPort.nodeId, fromPort: pendingPort.portId,
                   toNode: node.id, toPort: portDef.id, resourceId: portDef.id };
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

// Port center in WORLD space (accounts for zoom/pan)
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
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.8');
    path.style.filter = `drop-shadow(0 0 3px ${color})`;
    path.style.pointerEvents = 'stroke';
    path.style.cursor = 'pointer';
    path.addEventListener('click', () => _deleteConnection(conn.id));
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
    connections.filter(c => c.fromNode === nodeId || c.toNode === nodeId)
               .forEach(c => _deleteConnection(c.id, true));
    nodes = nodes.filter(n => n.id !== nodeId);
    const el = document.getElementById(`node-${nodeId}`);
    if (el) el.remove();
    _redrawAllConnections();
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
        if (e.target.closest('.fn-port, .fn-delete')) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        origX = node.x;     origY = node.y;
        el.style.zIndex = 100;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        node.x = Math.max(0, origX + (e.clientX - startX) / vpZoom);
        node.y = Math.max(0, origY + (e.clientY - startY) / vpZoom);
        el.style.left = node.x + 'px';
        el.style.top  = node.y + 'px';
        _redrawAllConnections();
    });

    document.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; el.style.zIndex = ''; }
    });
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
    data.nodes.forEach(n => { nodes.push(n); _renderNode(n); });
    data.connections.forEach(c => { connections.push(c); _drawConnection(c); });
}