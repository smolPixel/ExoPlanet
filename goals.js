import { increaseStat, decreaseStat } from './character.js'

export class daily {
    constructor(name, associated_stat, associated_value) {
        this.name = name;
        this.associated_stat = associated_stat;
        this.associated_value = associated_value;
        this.checked = false;
        this.streak = 0;
    }

    load_goal(goal) {
        for (const key in goal) {
            if (this.hasOwnProperty(key)) {
                this[key] = goal[key];
            }
        }
    }

    diminish_value(val) {
        this.associated_value = Math.max(0, this.associated_value - val);
        let safeValueAttribute = get_safe_Id(this.name, "value");
        let display = document.getElementById(safeValueAttribute);
        if (display) display.textContent = this.associated_value.toFixed(1);
    }

    increase_value(val) {
        this.associated_value = Math.min(1, this.associated_value + val);
        let safeValueAttribute = get_safe_Id(this.name, "value");
        let display = document.getElementById(safeValueAttribute);
        if (display) display.textContent = this.associated_value.toFixed(1);
    }
}

function get_safe_Id(id_string, postfix) {
    let safe_id = String(id_string).toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
    return `${safe_id}_${postfix}`;
}

export class Goals {
    constructor(dailies) {
        this.dailies = dailies;
    }

    load_goals(goals) {
        for (const key in goals.dailies) {
            if (this.dailies.hasOwnProperty(key)) {
                this.dailies[key].load_goal(goals.dailies[key]);
            }
        }
    }
}

export function reset_goals_daily(dico_goals, player) {
    let dico_char = player.iterate_values();
    let num_char = Object.keys(dico_char).length;
    for (let i = 0; i < num_char; i++) {
        let charname = Object.keys(dico_char)[i];
        let charvalue = dico_char[charname];
        let new_value = Math.max(1, charvalue - 0.5);
        player.set_char(charname, new_value);
    }

    dico_goals.forEach((x) => {
        const safeId = get_safe_Id(x.name, "goals");
        let checkbox = document.getElementById(safeId);
        if (!checkbox) return;

        const safeStreakId = get_safe_Id(x.name, "streak");
        const streakSpan = document.getElementById(safeStreakId);
        if (checkbox.checked == false) {
            let dico_char = player.iterate_values();
            let charvalue = dico_char[x.associated_stat];
            let new_value = charvalue - x.associated_value;
            player.set_char(x.associated_stat, new_value);
            x.streak = 0;
            if (streakSpan) streakSpan.textContent = `— 0`;
        } else {
            x.streak += 1;
            if (streakSpan) streakSpan.textContent = `🔥 ${x.streak}`;
        }

        checkbox.checked = false;
        x.checked = false;
    });
}

export function reset_goals(dico_goals) {
    dico_goals.forEach((x) => {
        const safeId = get_safe_Id(x.name, "goals");
        let checkbox = document.getElementById(safeId);
        if (checkbox) {
            checkbox.checked = false;
            x.checked = false;
        }
    });
}

export function cycle_goal(goal) {
    var next_stat = {
        "physical": "mental",
        "mental": "spiritual",
        "spiritual": "social_emotional",
        "social_emotional": "environmental",
        "environmental": "physical"
    };
    let current = goal.associated_stat;
    return (current in next_stat) ? next_stat[current] : "physical";
}

// FIX: accept a daily object (or create one from a string), and accept dico_goals ref for deletion
function add_goals(dico_goals, x, player) {
    // FIX: if x is a string (from the Add button), wrap it in a new daily object
    if (typeof x === 'string') {
        x = new daily(x, 'physical', 0.5);
        dico_goals.push(x);
    }

    const main = document.getElementById('Dailies');

    const row = document.createElement('div');
    row.className = 'goal-row';
    const safeRowId = get_safe_Id(x.name, "row");
    row.setAttribute('id', safeRowId);

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = x.name;
    const safeId = get_safe_Id(x.name, "goals");
    checkbox.setAttribute("id", safeId);
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            increaseStat(x.associated_stat, x.associated_value, player);
            x.checked = true;
        } else {
            decreaseStat(x.associated_stat, x.associated_value, player);
            x.checked = false;
        }
    });
    if (x.checked) checkbox.checked = true;

    // Label
    const label = document.createElement('label');
    label.setAttribute('for', safeId);
    label.textContent = x.name;

    // Stat span (click to cycle)
    const statSpan = document.createElement("span");
    statSpan.className = 'goal-stat';
    let safeIdAttribute = get_safe_Id(x.name, "attribute");
    statSpan.setAttribute("id", safeIdAttribute);
    statSpan.textContent = x.associated_stat;
    statSpan.title = "Click to cycle stat";
    statSpan.onclick = function () {
        x.associated_stat = cycle_goal(x);
        statSpan.textContent = x.associated_stat;
    };

    // Value controls
    const valueCtrls = document.createElement('div');
    valueCtrls.className = 'goal-value-controls';

    const minusBtn = document.createElement("button");
    minusBtn.innerHTML = "−";
    minusBtn.className = 'goal-btn';
    minusBtn.onclick = function () { x.diminish_value(0.1); };

    const valueSpan = document.createElement("span");
    valueSpan.className = 'goal-value';
    valueSpan.textContent = x.associated_value.toFixed(1);
    let safeValueAttribute = get_safe_Id(x.name, "value");
    valueSpan.setAttribute("id", safeValueAttribute);

    const plusBtn = document.createElement("button");
    plusBtn.innerHTML = "+";
    plusBtn.className = 'goal-btn';
    plusBtn.onclick = function () { x.increase_value(0.1); };

    valueCtrls.appendChild(minusBtn);
    valueCtrls.appendChild(valueSpan);
    valueCtrls.appendChild(plusBtn);

    // FIX: streak span with correct ID
    const streakSpan = document.createElement("span");
    streakSpan.className = 'goal-streak';
    let safeStreakId = get_safe_Id(x.name, "streak");
    streakSpan.setAttribute("id", safeStreakId);
    streakSpan.textContent = x.streak > 0 ? `🔥 ${x.streak}` : `— 0`;

    // FIX: delete button wired up to remove from DOM and dico_goals array
    const deleteBtn = document.createElement("button");
    deleteBtn.className = 'goal-delete';
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete goal";
    deleteBtn.onclick = function () {
        const idx = dico_goals.indexOf(x);
        if (idx !== -1) dico_goals.splice(idx, 1);
        row.remove();
    };

    row.appendChild(checkbox);
    row.appendChild(label);
    row.appendChild(statSpan);
    row.appendChild(valueCtrls);
    row.appendChild(streakSpan);
    row.appendChild(deleteBtn);

    main.appendChild(row);
}

export function set_goals(dico_goals, player) {
    const main = document.getElementById('Dailies');

    dico_goals.forEach((x) => {
        add_goals(dico_goals, x, player);
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'goal-btn-row';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'goal-action-btn';
    resetBtn.innerHTML = 'RESET';
    // FIX: pass dico_goals correctly
    resetBtn.onclick = function () { reset_goals(dico_goals); };

    const dayResetBtn = document.createElement('button');
    dayResetBtn.className = 'goal-action-btn';
    dayResetBtn.innerHTML = 'DAILY RESET';
    dayResetBtn.onclick = function () { reset_goals_daily(dico_goals, player); };

    btnRow.appendChild(resetBtn);
    btnRow.appendChild(dayResetBtn);
    main.appendChild(btnRow);

    // FIX: pass actual daily object to add_goals, not just the string
    const addBtn = document.getElementById('buttonAddDailyTask');
    if (addBtn) {
        addBtn.onclick = function () {
            const nameInput = document.getElementById('newdailyTaskName');
            const name = nameInput.value.trim();
            if (!name) return;
            add_goals(dico_goals, name, player);
            nameInput.value = '';
        };
    }
}