import { character } from "./character.js";
import { daily, set_goals, Goals } from "./goals.js";
import { init_factories, init_canvas_cancel, tickNodeGraph, save_factories, load_factories, upgradeRandomNode, setConnTransferRate, resetFactory, refreshDeposits } from "./factories.js";
import { init_upgrades, save_upgrades, load_upgrades, reset_upgrades, init_phase_overlay, fire_phase_entry } from "./upgrades.js";
import { init_options, save_dyn_settings, load_dyn_settings } from "./options.js";

var player = new character();

// ── Resources ─────────────────────────────────────────────────

class Resource {
    constructor(name, quantity, cost, capacity) {
        this.name = name; this.quantity = quantity;
        this.production = 0; this.cost = cost; this.capacity = capacity; this.playerBonus = 0;
    }
    load_ressource(data) {
        for (const [k, v] of Object.entries(data)) { if (k in this) this[k] = v; }
    }
}
class Creator {
    constructor(name, quantity, cost, create) {
        this.name = name; this.quantity = quantity;
        this.production = 0; this.cost = cost; this.create = create;
    }
    load_ressource(data) {
        for (const [k, v] of Object.entries(data)) { if (k in this) this[k] = v; }
    }
}
class AllRessources {
    constructor() {
        this.dictionnary = {
            'Iron':        new Resource("Iron",        0, [["Energy",1]], 200),
            'Energy':      new Resource("Energy",      0, [], 200),
            'Copper':      new Resource("Copper",      0, [["Energy",1]], 200),
            'Wood':        new Resource("Wood",        0, [["Energy",1]], 200),
            'Iron Plates': new Resource("Iron Plates", 0, [["Energy",1],['Iron',1]], 200),
            'Screws':      new Resource("Screws",      0, [["Energy",1],['Iron',1]], 200),
            'Coils':       new Resource("Coils",       0, [["Energy",1],['Copper',1]], 200),
            'Wires':       new Resource("Wires",       0, [["Energy",1],['Coils',1]], 200),
            'Biofuel':     new Resource("Biofuel",     0, [["Wood",5]], 200),
            'Iron Mines':  new Creator("Iron Mines",   0, [['Iron Plates',5],['Screws',20],['Iron',20],['Wires',5]], [['Iron',1]])
        };
    }
}

var all_resources = new AllRessources();
var dicoGoals     = [];
var all_goals     = new Goals(dicoGoals);

// ── Vitals ────────────────────────────────────────────────────
let stamina      = 100;
let mentalHealth = 100;
let _exploreTicks = 0;

function _updateVitals() {
    const barS = document.getElementById('bar-stamina');
    const valS = document.getElementById('val-stamina');
    const barM = document.getElementById('bar-mentalhealth');
    const valM = document.getElementById('val-mentalhealth');
    if (barS) barS.style.width = stamina + '%';
    if (valS) valS.textContent = Math.round(stamina);
    if (barM) barM.style.width = mentalHealth + '%';
    if (valM) valM.textContent = Math.round(mentalHealth);
}

// ── Zone definitions ──────────────────────────────────────────
// Max findable deposits per resource type, per zone.
const ZONE_DEFS = {
    'crash-plateau': { deposits: { iron: 1, wood: 2, copper: 1 } }
};
const ACTIVE_ZONE = 'crash-plateau';

// ── Deposits (limited raw resource nodes) ─────────────────────
// Tracks how many of each raw deposit have been found / not yet placed.
let deposits   = { iron: 1, wood: 1, copper: 0 };
let discovered = { iron: true, wood: true, copper: false };
// Tracks total found per zone (cumulative; doesn't decrement when placed).
let zoneFound  = { 'crash-plateau': { iron: 1, wood: 1, copper: 0 } };

export function getDeposits()        { return deposits; }
export function getDiscovered()      { return discovered; }
export function consumeDeposit(key)  {
    if ((deposits[key] || 0) <= 0) return false;
    deposits[key]--;
    return true;
}
export function refundDeposit(key)   { deposits[key] = (deposits[key] || 0) + 1; }

// ── Event Log ─────────────────────────────────────────────────

const MAX_LOG = 40;
let systemLog = [];
let kelpyLog  = [];
let activeCommTab = 'system';

// ── Shared production helper ───────────────────────────────────
// outputs / inputs: [[resourceKey, amount], ...]
// Checks all outputs have room and all inputs have enough, then applies
// the mutations atomically. Returns true on success, false otherwise.
export function tryProduce(outputs, inputs) {
    const d = all_resources.dictionnary;
    for (const [key, amt] of outputs) {
        if (!d[key] || d[key].quantity >= d[key].capacity) return false;
    }
    for (const [key, amt] of inputs) {
        if (!d[key] || d[key].quantity < amt) return false;
    }
    for (const [key, amt] of inputs)  d[key].quantity -= amt;
    for (const [key, amt] of outputs) d[key].quantity = Math.min(d[key].quantity + amt, d[key].capacity);
    return true;
}

export function pushMessage(text, type = 'info', channel = 'system') {
    // type: 'info' | 'milestone' | 'warning' | 'story'
    // channel: 'system' | 'kelpy'
    const entry = { text, type, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) };
    const log = channel === 'kelpy' ? kelpyLog : systemLog;
    log.unshift(entry);
    if (log.length > MAX_LOG) log.pop();

    if (channel !== activeCommTab) {
        document.getElementById(`notif-${channel}`)?.classList.remove('hidden');
    }
    document.getElementById(`tab-${channel}`)?.classList.add('tab-flashing');
    _renderEventLog();
}

function _renderEventLog() {
    const container = document.getElementById('event-log-entries');
    if (!container) return;
    const log = activeCommTab === 'kelpy' ? kelpyLog : systemLog;
    container.innerHTML = '';
    log.forEach(entry => {
        const row = document.createElement('div');
        row.className = `log-entry log-${entry.type}`;
        row.innerHTML = `<span class="log-time">${entry.time}</span><span class="log-text">${entry.text}</span>`;
        container.appendChild(row);
    });
}

function _initCommsTabs() {
    ['system', 'kelpy'].forEach(ch => {
        document.getElementById(`tab-${ch}`)?.addEventListener('click', () => {
            activeCommTab = ch;
            document.querySelectorAll('.comms-tab').forEach(t => t.classList.remove('active'));
            const tabEl = document.getElementById(`tab-${ch}`);
            tabEl?.classList.add('active');
            tabEl?.classList.remove('tab-flashing');
            document.getElementById(`notif-${ch}`)?.classList.add('hidden');
            _renderEventLog();
        });
    });
}

// ── Milestone tracking ────────────────────────────────────────

const _milestones = {
    energy100:     false,
    iron50:        false,
    ironPlates10:  false,
    firstFactory:  false,
};

function _checkMilestones() {
    const d = all_resources.dictionnary;
    if (!_milestones.energy100 && d['Energy'].quantity >= 100) {
        _milestones.energy100 = true;
        pushMessage('⚡ Energy reserves hit 100. The grid is stabilising.', 'milestone');
    }
    if (!_milestones.iron50 && d['Iron'].quantity >= 50) {
        _milestones.iron50 = true;
        pushMessage('⬡ Iron stockpile growing. Construction is possible.', 'milestone');
    }
    if (!_milestones.ironPlates10 && d['Iron Plates'].quantity >= 10) {
        _milestones.ironPlates10 = true;
        pushMessage('▣ First iron plates produced. Industrial age begins.', 'milestone');
    }
}

// ── Checklist ─────────────────────────────────────────────────

let checklist = [];  // { id, text, done }
let checklistNextId = 1;

function _renderChecklist() {
    const container = document.getElementById('checklist-items');
    if (!container) return;
    container.innerHTML = '';
    checklist.forEach(item => {
        const row = document.createElement('div');
        row.className = `checklist-row${item.done ? ' checklist-done' : ''}`;

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = item.done;
        cb.className = 'checklist-cb';
        cb.addEventListener('change', () => {
            item.done = cb.checked;
            row.classList.toggle('checklist-done', item.done);
            if (item.done) {
                setTimeout(() => {
                    checklist = checklist.filter(i => i.id !== item.id);
                    _renderChecklist();
                }, 400);
            }
        });

        const label = document.createElement('span');
        label.className = 'checklist-label';
        label.textContent = item.text;
        label.addEventListener('dblclick', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = item.text;
            input.className = 'checklist-rename-input';
            label.replaceWith(input);
            input.focus();
            input.select();

            function commitRename() {
                const newText = input.value.trim();
                if (newText) item.text = newText;
                label.textContent = item.text;
                input.replaceWith(label);
            }

            input.addEventListener('blur', commitRename);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { input.blur(); }
                if (e.key === 'Escape') { input.value = item.text; input.blur(); }
            });
        });

        const del = document.createElement('button');
        del.className = 'checklist-del';
        del.textContent = '✕';
        del.addEventListener('click', () => {
            checklist = checklist.filter(i => i.id !== item.id);
            _renderChecklist();
        });

        row.appendChild(cb);
        row.appendChild(label);
        row.appendChild(del);
        container.appendChild(row);
    });
}

function _initChecklist() {
    const addBtn   = document.getElementById('checklist-add-btn');
    const addInput = document.getElementById('checklist-add-input');
    if (!addBtn || !addInput) return;
    addBtn.addEventListener('click', () => {
        const text = addInput.value.trim();
        if (!text) return;
        checklist.push({ id: checklistNextId++, text, done: false });
        addInput.value = '';
        _renderChecklist();
    });
    addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });
}

// ── Resource helpers ──────────────────────────────────────────

const resIdMap = {
    "Energy":"assign-energy","Iron":"assign-iron","Copper":"assign-copper",
    "Wood":"assign-wood","Biofuel":"assign-biofuel","Iron Plates":"assign-iron-plates","Screws":"assign-screws",
    "Coils":"assign-coils","Wires":"assign-wires",
};

function _deactivateCurrent() {
    const old = player.current_assignment;
    if (old == null) return;
    if (old === 'rest' || old === 'explore') {
        document.getElementById(`action-${old}`)?.classList.remove('active');
    } else {
        const oldRes = all_resources.dictionnary[old];
        if (oldRes) oldRes.playerBonus = 0;
        document.getElementById(resIdMap[old])?.classList.remove('active');
    }
}

function _updateActionDisplay() {
    const el = document.getElementById('char-action-status');
    if (!el) return;
    const a = player.current_assignment;
    el.textContent = a ? `ACTION: ${a.toUpperCase()}` : 'ACTION: IDLE';
}

function _restoreAssignmentUI() {
    const a = player.current_assignment;
    if (!a) return;
    if (a === 'rest' || a === 'explore') {
        document.getElementById(`action-${a}`)?.classList.add('active');
    } else {
        const res = all_resources.dictionnary[a];
        if (res) res.playerBonus = player.physical;
        document.getElementById(resIdMap[a])?.classList.add('active');
    }
    _updateActionDisplay();
}

function assignPlayer(ressource) {
    _deactivateCurrent();
    if (player.current_assignment === ressource) {
        player.current_assignment = null;
        _updateActionDisplay();
        return;
    }
    const res = all_resources.dictionnary[ressource];
    player.current_assignment = ressource;
    res.playerBonus = player.physical;
    document.getElementById(resIdMap[ressource])?.classList.add('active');
    _updateActionDisplay();
}

function setRestExplore(action) {
    _deactivateCurrent();
    if (player.current_assignment === action) {
        player.current_assignment = null;
        _updateActionDisplay();
        return;
    }
    player.current_assignment = action;
    document.getElementById(`action-${action}`)?.classList.add('active');
    _updateActionDisplay();
}

window.DecreaseCreator = DecreaseCreator;
window.IncreaseCreator = IncreaseCreator;

const reslength = Object.keys(all_resources.dictionnary).length;

function updateResource(id, value, capacity) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `${Math.round(value)}/${capacity}`;
}

function DecreaseCreator(id) {
    const res = all_resources.dictionnary[id];
    if (res.quantity === 0) return;
    res.cost.forEach(x => { all_resources.dictionnary[x[0]].quantity += x[1]; });
    res.quantity -= 1;
    res.create.forEach(x => { all_resources.dictionnary[x[0]].production -= x[1]; });
    updateResource(res.name, res.quantity, res.capacity);
}

function IncreaseCreator(id) {
    const res = all_resources.dictionnary[id];
    const d   = all_resources.dictionnary;
    const canAfford = res.cost.every(([key, amt]) => d[key] && d[key].quantity >= amt * res.production);
    if (canAfford) res.cost.forEach(([key, amt]) => { d[key].quantity -= amt * res.production; });
    res.quantity += 1;
    res.create.forEach(x => { d[x[0]].production += x[1]; });
    if (canAfford) updateResource(res.name, res.quantity, res.capacity);
}

function TickResource(res) {
    if (res.production > 0) {
        const inputs  = res.cost.map(([key, amtPerUnit]) => [key, amtPerUnit * res.production]);
        tryProduce([[res.name, res.production]], inputs);
    }
    if (res.playerBonus > 0) {
        res.playerBonus = player.physical;
        const otherCosts = res.cost.filter(([key]) => key !== 'Energy');

        // Cap output by what non-energy inputs can support (sequential in spirit)
        let maxOutput = res.playerBonus;
        for (const [key, amtPerUnit] of otherCosts) {
            if (amtPerUnit > 0) {
                const avail = all_resources.dictionnary[key]?.quantity || 0;
                maxOutput = Math.min(maxOutput, Math.floor(avail / amtPerUnit));
            }
        }

        if (maxOutput > 0) {
            const energyCost = res.name === 'Energy' ? [] : [['Energy', 1]];
            const inputs = [...energyCost, ...otherCosts.map(([key, amt]) => [key, amt * maxOutput])];
            tryProduce([[res.name, maxOutput]], inputs);
        }
    }
    updateResource(res.name, res.quantity, res.capacity);
}

// ── Game class ────────────────────────────────────────────────

class ExoPlanet {
    constructor(player, ressources, goals) {
        this.player = player; this.ressources = ressources; this.goals = goals;
    }
    set_Game() {
        const s = document.getElementById('SaveButton');
        if (s) s.addEventListener('click', () => this.SaveGame());
        const l = document.getElementById('LoadButton');
        if (l) l.addEventListener('click', () => this.LoadGame());
    }
    SaveGame() {
        localStorage.setItem("save", JSON.stringify({
            dico:      this.ressources.dictionnary,
            player:    this.player,
            goals:     dicoGoals,
            factories: save_factories(),
            upgrades:  save_upgrades(),
            systemLog,
            kelpyLog,
            milestones: _milestones,
            checklist,
            checklistNextId,
            dynSettings: save_dyn_settings(),
            deposits,
            discovered,
            zoneFound,
            stamina,
            mentalHealth,
        }));
    }
    LoadGame() {
        const raw = localStorage.getItem("save");
        if (!raw) return;
        const s = JSON.parse(raw);

        if (s.dico) {
            for (const k in s.dico) {
                if (s.dico.hasOwnProperty(k) && all_resources.dictionnary[k])
                    all_resources.dictionnary[k].load_ressource(s.dico[k]);
            }
        }
        if (s.player)    this.player.load_player(s.player);
        if (s.goals && Array.isArray(s.goals)) {
            dicoGoals.length = 0;
            s.goals.forEach(g => {
                const d = new daily(g.name, g.associated_stat, g.associated_value);
                d.checked = g.checked; d.streak = g.streak;
                dicoGoals.push(d);
            });
        }
        if (s.factories)  load_factories(s.factories);
        if (s.upgrades)   load_upgrades(s.upgrades);
        // Support old saves that used a single eventLog array
        if (s.systemLog)  { systemLog = s.systemLog; }
        else if (s.eventLog) { systemLog = s.eventLog; }
        if (s.kelpyLog)   { kelpyLog = s.kelpyLog; }
        _renderEventLog();
        for (const [name, res] of Object.entries(all_resources.dictionnary)) {
            updateResource(name, res.quantity, res.capacity);
        }
        if (s.milestones) Object.assign(_milestones, s.milestones);
        if (s.checklist)   { checklist = s.checklist; checklistNextId = s.checklistNextId || checklist.length + 1; _renderChecklist(); }
        if (s.dynSettings) load_dyn_settings(s.dynSettings);
        if (s.deposits)    Object.assign(deposits, s.deposits);
        if (s.discovered)  Object.assign(discovered, s.discovered);
        if (s.zoneFound) {
            for (const zone in s.zoneFound) {
                if (!zoneFound[zone]) zoneFound[zone] = {};
                Object.assign(zoneFound[zone], s.zoneFound[zone]);
            }
        } else {
            // Migrate old saves: infer zoneFound from current deposits + placed nodes
            zoneFound['crash-plateau'] = { iron: deposits.iron || 0, wood: deposits.wood || 0, copper: deposits.copper || 0 };
        }
        if (s.stamina      !== undefined) stamina      = s.stamina;
        if (s.mentalHealth !== undefined) mentalHealth = s.mentalHealth;
        refreshDeposits();
        _refreshExploreTileState();
        _updateVitals();
        _restoreAssignmentUI();
    }
}

var exo_planet = new ExoPlanet(player, all_resources, all_goals);

// ── Tick ──────────────────────────────────────────────────────

// Explore deposit discovery chances per tick
const EXPLORE_CHANCES = [
    { key: 'iron',   chance: 0.001,  label: '⛏ Iron deposit found',   type: 'milestone' },
    { key: 'wood',   chance: 0.005, label: '🌲 Wood deposit found',   type: 'info' },
    { key: 'copper', chance: 0.001, label: '🪨 Copper deposit found', type: 'milestone' },
];

function TickEverything() {
    for (let i = 0; i < reslength; i++) {
        TickResource(all_resources.dictionnary[Object.keys(all_resources.dictionnary)[i]]);
    }
    tickNodeGraph();
    _checkMilestones();

    if (player.current_assignment === 'explore') {
        _exploreTicks++;
        if (_exploreTicks % 10 === 0) {
            stamina = Math.max(0, stamina - 1);
        }
        let found = false;
        const zoneDef = ZONE_DEFS[ACTIVE_ZONE];
        const zf = zoneFound[ACTIVE_ZONE];
        EXPLORE_CHANCES.forEach(({ key, chance, label, type }) => {
            if ((zf[key] || 0) >= (zoneDef.deposits[key] || 0)) return;
            if (Math.random() < chance) {
                deposits[key] = (deposits[key] || 0) + 1;
                zf[key] = (zf[key] || 0) + 1;
                discovered[key] = true;
                pushMessage(`${label} (${deposits[key]} available)`, type);
                found = true;
            }
        });
        if (found) {
            refreshDeposits();
            _refreshExploreTileState();
        }
    }

    _updateVitals();
    document.getElementById('physical').innerHTML         = player.physical.toFixed(1);
    document.getElementById('mental').innerHTML           = player.mental.toFixed(1);
    document.getElementById('spiritual').innerHTML        = player.spiritual.toFixed(1);
    document.getElementById('social_emotional').innerHTML = player.social_emotional.toFixed(1);
    document.getElementById('environmental').innerHTML    = player.environmental.toFixed(1);

    exo_planet.SaveGame();
}

function addEventListeners() {
    document.getElementById('action-rest')?.addEventListener('click', () => setRestExplore('rest'));
    document.getElementById('action-explore')?.addEventListener('click', () => _openExploreModal());
}

// ── Explore Modal ─────────────────────────────────────────────

function _openExploreModal() {
    const modal = document.getElementById('explore-modal');
    if (!modal) return;
    _refreshExploreTileState();
    modal.classList.remove('hidden');
}

function _closeExploreModal() {
    document.getElementById('explore-modal')?.classList.add('hidden');
}

function _refreshExploreTileState() {
    const tile   = document.getElementById('tile-crash-plateau');
    const status = document.getElementById('tile-crash-plateau-status');
    if (!tile || !status) return;
    const active = player.current_assignment === 'explore';
    tile.classList.toggle('map-tile-active', active);
    status.textContent = active ? 'EXPLORING' : 'AVAILABLE';

    const zoneDef = ZONE_DEFS[ACTIVE_ZONE];
    const zf = zoneFound[ACTIVE_ZONE];
    const totalMax   = Object.values(zoneDef.deposits).reduce((a, b) => a + b, 0);
    const totalFound = Object.values(zf).reduce((a, b) => a + b, 0);
    const pct = totalMax > 0 ? Math.round((totalFound / totalMax) * 100) : 0;

    const pctEl = document.getElementById('tile-crash-plateau-pct');
    if (pctEl) pctEl.textContent = `${pct}% SURVEYED`;
    const barEl = document.getElementById('tile-crash-plateau-bar');
    if (barEl) barEl.style.width = `${pct}%`;
}

function _initExploreModal() {
    document.getElementById('explore-modal-close')?.addEventListener('click', _closeExploreModal);

    document.getElementById('tile-crash-plateau')?.addEventListener('click', () => {
        const wasExploring = player.current_assignment === 'explore';
        setRestExplore('explore');
        _refreshExploreTileState();
        _closeExploreModal();
        if (!wasExploring) pushMessage('Exploring Crash Plateau.', 'info');
    });

    document.getElementById('explore-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) _closeExploreModal();
    });
}

// ── Dev Console ───────────────────────────────────────────────

function _initDevConsole() {
    const toggle  = document.getElementById('dev-console-toggle');
    const body    = document.getElementById('dev-console-body');
    const hint    = document.getElementById('dev-console-hint');
    const input   = document.getElementById('dev-console-input');
    const runBtn  = document.getElementById('dev-console-run');
    const output  = document.getElementById('dev-console-output');
    if (!toggle || !body || !input || !runBtn || !output) return;

    toggle.addEventListener('click', () => {
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : 'block';
        hint.textContent = open ? '▶ COLLAPSED — click to expand' : '▼ EXPANDED';
    });

    function devLog(text, cls) {
        const line = document.createElement('div');
        line.className = cls;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    const STATS = ['physical','mental','spiritual','social_emotional','environmental'];

    function runCommand(raw) {
        const parts = raw.trim().split(/\s+/);
        const cmd   = parts[0]?.toLowerCase();

        if (!cmd) return;

        if (cmd === 'help') {
            devLog('Commands:', 'dev-line-info');
            devLog('  stat <name> <value>   — set character stat (physical, mental, spiritual, social_emotional, environmental)', 'dev-line-info');
            devLog('  resetstats            — reset all character stats to 1', 'dev-line-info');
            devLog('  res  <name> <amount>  — set resource quantity (e.g. res Iron 999)', 'dev-line-info');
            devLog('  cap  <name> <amount>  — set resource capacity / inventory space', 'dev-line-info');
            devLog('  list res              — show all resource names', 'dev-line-info');
            devLog('  fillall               — set all resources to max capacity', 'dev-line-info');
            devLog('  reset                 — clear factory grid, reset all capacities to 200, sidebar to L1', 'dev-line-info');
            devLog('  clear                 — clear console output', 'dev-line-info');
            return;
        }

        if (cmd === 'clear') { output.innerHTML = ''; return; }

        if (cmd === 'reset') {
            resetFactory();
            reset_upgrades();
            const d = all_resources.dictionnary;
            for (const [name, res] of Object.entries(d)) {
                if (typeof res.capacity === 'number') {
                    res.capacity = 200;
                    if (typeof res.quantity === 'number') res.quantity = 0;
                    updateResource(name, res.quantity, res.capacity);
                }
            }
            deposits.iron   = 1;
            deposits.wood   = 1;
            deposits.copper = 0;
            discovered.iron   = true;
            discovered.wood   = true;
            discovered.copper = false;
            zoneFound['crash-plateau'] = { iron: 1, wood: 1, copper: 0 };
            refreshDeposits();
            _refreshExploreTileState();
            systemLog = [];
            kelpyLog  = [];
            _renderEventLog();
            pushMessage('🛸 EXOPLANET OS v0.1 — Systems initialising...', 'story');
            pushMessage('Colony life support: NOMINAL. Begin resource extraction.', 'info');
            fire_phase_entry(0);
            devLog('OK: factory grid cleared, all capacities reset to 200, transfer rate reset to 1', 'dev-line-ok');
            return;
        }

        if (cmd === 'fillall') {
            const d = all_resources.dictionnary;
            for (const [name, res] of Object.entries(d)) {
                if (typeof res.quantity === 'number' && typeof res.capacity === 'number') {
                    res.quantity = res.capacity;
                }
            }
            devLog('OK: all resources set to max capacity', 'dev-line-ok');
            return;
        }

        if (cmd === 'list' && parts[1] === 'res') {
            devLog('Resources: ' + Object.keys(all_resources.dictionnary).join(', '), 'dev-line-info');
            return;
        }

        if (cmd === 'resetstats') {
            STATS.forEach(s => player.set_char(s, 1));
            devLog('OK: all stats reset to 1', 'dev-line-ok');
            return;
        }

        if (cmd === 'stat') {
            const stat = parts[1];
            const val  = parseFloat(parts[2]);
            if (!stat || isNaN(val)) { devLog('Usage: stat <name> <value>', 'dev-line-err'); return; }
            if (!STATS.includes(stat)) { devLog(`Unknown stat "${stat}". Valid: ${STATS.join(', ')}`, 'dev-line-err'); return; }
            player.set_char(stat, val);
            devLog(`OK: ${stat} = ${val}`, 'dev-line-ok');
            return;
        }

        if (cmd === 'res') {
            const name = parts.slice(1, -1).join(' ');
            const val  = parseFloat(parts[parts.length - 1]);
            if (!name || isNaN(val)) { devLog('Usage: res <name> <amount>', 'dev-line-err'); return; }
            const res = all_resources.dictionnary[name];
            if (!res) { devLog(`Unknown resource "${name}". Use: list res`, 'dev-line-err'); return; }
            res.quantity = Math.min(val, res.capacity);
            devLog(`OK: ${name} quantity = ${res.quantity}`, 'dev-line-ok');
            return;
        }

        if (cmd === 'cap') {
            const name = parts.slice(1, -1).join(' ');
            const val  = parseFloat(parts[parts.length - 1]);
            if (!name || isNaN(val)) { devLog('Usage: cap <name> <amount>', 'dev-line-err'); return; }
            const res = all_resources.dictionnary[name];
            if (!res) { devLog(`Unknown resource "${name}". Use: list res`, 'dev-line-err'); return; }
            res.capacity = val;
            devLog(`OK: ${name} capacity = ${val}`, 'dev-line-ok');
            return;
        }

        devLog(`Unknown command "${cmd}". Type help.`, 'dev-line-err');
    }

    runBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) return;
        devLog('> ' + val, 'dev-line-info');
        runCommand(val);
        input.value = '';
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runBtn.click();
    });
}

function _getSaveJSON() {
    exo_planet.SaveGame(); // flush latest state to localStorage first
    return localStorage.getItem("save");
}

function _loadSaveJSON(json) {
    localStorage.setItem("save", json);
    exo_planet.LoadGame();
}

window.onload = () => {
    exo_planet.set_Game();
    init_factories(all_resources, tryProduce, getDeposits, consumeDeposit, refundDeposit, getDiscovered, assignPlayer);
    init_upgrades(all_resources, upgradeRandomNode, pushMessage, setConnTransferRate);
    exo_planet.LoadGame();
    set_goals(dicoGoals, player);
    addEventListeners();
    init_canvas_cancel();
    _initChecklist();
    _initCommsTabs();
    _initDevConsole();
    init_options(_getSaveJSON, _loadSaveJSON);
    init_phase_overlay();
    _initExploreModal();
    // Boot messages — only push if log is empty (i.e. fresh game)
    if (systemLog.length === 0) {
        pushMessage('🛸 EXOPLANET OS v0.1 — Systems initialising...', 'story');
        pushMessage('Colony life support: NOMINAL. Begin resource extraction.', 'info');
    }
    if (kelpyLog.length === 0) fire_phase_entry(0);
};

setInterval(TickEverything, 1000);