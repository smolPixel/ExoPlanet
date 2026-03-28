import { character } from "./character.js";
import { daily, set_goals, Goals } from "./goals.js";
import { init_factories, init_canvas_cancel, tickNodeGraph, save_factories, load_factories } from "./factories.js";

var player = new character();

// ── Resources ─────────────────────────────────────────────────

class Resource {
    constructor(name, quantity, cost, capacity) {
        this.name = name; this.quantity = quantity;
        this.production = 0; this.cost = cost; this.capacity = capacity;
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
            'Iron Mines':  new Creator("Iron Mines",   0, [['Iron Plates',5],['Screws',20],['Iron',20],['Wires',5]], [['Iron',1]])
        };
    }
}

var all_resources = new AllRessources();
var dicoGoals     = [];
var all_goals     = new Goals(dicoGoals);

// ── Event Log ─────────────────────────────────────────────────

const MAX_LOG = 40;
let eventLog = [];

export function pushMessage(text, type = 'info') {
    // type: 'info' | 'milestone' | 'warning' | 'story'
    const entry = { text, type, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) };
    eventLog.unshift(entry);
    if (eventLog.length > MAX_LOG) eventLog.pop();
    _renderEventLog();
}

function _renderEventLog() {
    const container = document.getElementById('event-log-entries');
    if (!container) return;
    container.innerHTML = '';
    eventLog.forEach(entry => {
        const row = document.createElement('div');
        row.className = `log-entry log-${entry.type}`;
        row.innerHTML = `<span class="log-time">${entry.time}</span><span class="log-text">${entry.text}</span>`;
        container.appendChild(row);
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
        });

        const label = document.createElement('span');
        label.className = 'checklist-label';
        label.textContent = item.text;

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
    "Wood":"assign-wood","Iron Plates":"assign-iron-plates","Screws":"assign-screws",
    "Coils":"assign-coils","Wires":"assign-wires",
};

function assignPlayer(ressource) {
    const speed   = player.getmeanval();
    const res     = all_resources.dictionnary[ressource];
    const old_ass = player.current_assignment;
    if (old_ass != null) {
        const oldRes = all_resources.dictionnary[old_ass];
        oldRes.production = Math.max(0, oldRes.production - speed);
        const oldEl = document.getElementById(resIdMap[old_ass]);
        if (oldEl) oldEl.classList.remove('active');
    }
    player.current_assignment = ressource;
    res.production += speed;
    const newEl = document.getElementById(resIdMap[ressource]);
    if (newEl) newEl.classList.add('active');
}

window.DecreaseCreator = DecreaseCreator;
window.IncreaseCreator = IncreaseCreator;

const reslength = Object.keys(all_resources.dictionnary).length;

function updateResource(id, value, capacity) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `${Math.round(value)}/${capacity}`;
}

function check_and_take_requirements(res) {
    let can = true;
    res.cost.forEach(x => { if (all_resources.dictionnary[x[0]].quantity < x[1] * res.production) can = false; });
    if (!can) return false;
    res.cost.forEach(x => { all_resources.dictionnary[x[0]].quantity -= x[1] * res.production; });
    return true;
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
    const res     = all_resources.dictionnary[id];
    const correct = check_and_take_requirements(res);
    res.quantity += 1;
    res.create.forEach(x => { all_resources.dictionnary[x[0]].production += x[1]; });
    if (correct) updateResource(res.name, res.quantity, res.capacity);
}

function TickResource(res) {
    if (!check_and_take_requirements(res)) return;
    res.quantity = Math.min(res.quantity + res.production, res.capacity);
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
            eventLog,
            milestones: _milestones,
            checklist,
            checklistNextId,
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
        if (s.eventLog)   { eventLog = s.eventLog; _renderEventLog(); }
        if (s.milestones) Object.assign(_milestones, s.milestones);
        if (s.checklist)  { checklist = s.checklist; checklistNextId = s.checklistNextId || checklist.length + 1; _renderChecklist(); }
    }
}

var exo_planet = new ExoPlanet(player, all_resources, all_goals);

// ── Tick ──────────────────────────────────────────────────────

function TickEverything() {
    for (let i = 0; i < reslength; i++) {
        TickResource(all_resources.dictionnary[Object.keys(all_resources.dictionnary)[i]]);
    }
    tickNodeGraph();
    _checkMilestones();

    document.getElementById('physical').innerHTML         = player.physical.toFixed(1);
    document.getElementById('mental').innerHTML           = player.mental.toFixed(1);
    document.getElementById('spiritual').innerHTML        = player.spiritual.toFixed(1);
    document.getElementById('social_emotional').innerHTML = player.social_emotional.toFixed(1);
    document.getElementById('environmental').innerHTML    = player.environmental.toFixed(1);

    exo_planet.SaveGame();
}

function addEventListeners() {
    [["assign-energy","Energy"],["assign-iron","Iron"],["assign-copper","Copper"],
     ["assign-wood","Wood"],["assign-iron-plates","Iron Plates"],["assign-screws","Screws"],
     ["assign-coils","Coils"],["assign-wires","Wires"]].forEach(([elId, res]) => {
        const el = document.getElementById(elId);
        if (el) el.addEventListener("click", () => assignPlayer(res));
    });
}

window.onload = () => {
    exo_planet.set_Game();
    exo_planet.LoadGame();
    addEventListeners();
    set_goals(dicoGoals, player);
    init_factories(all_resources);
    init_canvas_cancel();
    _initChecklist();
    // Boot message — only push if log is empty (i.e. fresh game)
    if (eventLog.length === 0) {
        pushMessage('🛸 EXOPLANET OS v0.1 — Systems initialising...', 'story');
        pushMessage('Colony life support: NOMINAL. Begin resource extraction.', 'info');
    }
};

setInterval(TickEverything, 1000);