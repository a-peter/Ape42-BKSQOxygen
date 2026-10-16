// Version 1.1.0
// Author: Ape42

const PSI_MAX       = 1850; // full bottle
// SpO2 colour bands (common clinical hypoxemia thresholds)
const SPO2_MILD     = 95;   // below: mild hypoxemia     -> yellow
const SPO2_LOW      = 90;   // below: moderate hypoxemia -> orange
const SPO2_CRIT     = 85;   // below: severe hypoxemia   -> red
const PSI_LOW_PCT   = 25;   // amber below this fill level
const PSI_CRIT_PCT  = 10;   // red below this fill level
const SCALE_MIN     = 0.5;  // resize limits
const SCALE_MAX     = 3;
const SCALE_STEP    = 0.05; // per wheel notch
const BASE_FONT_PX  = 16;   // 1em at 100 %, must match code.css
const DBLCLICK_MS   = 250;  // single click waits this long for a possible double-click
const DRAG_PX       = 3;    // mouse moved more than this = drag, not a click

this.host_el   = null;
this.oxi_el    = null;
this.spo2_el   = null;
this.lever_el  = null;
this.bottle_el = null;
this.fill_el   = null;
this.psi_el    = null;
this.clickTimer = null;

this.widgetStore = {
    // Widget position (persisted)
    posX: null,
    posY: null,
    // Widget size factor (persisted)
    scale: 1,
    // Runtime state (not persisted)
    manualHide: false,
    spo2:       null,
    oxygenOn:   null,
    psi:        null,
};
this.$api.datastore.import(this.widgetStore);
this.widgetStore.manualHide = false; // always start visible
this.widgetStore.spo2       = null;
this.widgetStore.oxygenOn   = null;
this.widgetStore.psi        = null;

// Persist only position and size
const saveStore = () => {
    const ws = this.widgetStore;
    this.$api.datastore.export({ posX: ws.posX, posY: ws.posY, scale: ws.scale });
};

// All CSS sizes are em, so changing the base font size re-renders sharply
// (transform: scale() would only stretch the rendered bitmap)
const applyScale = () => {
    if (!this.host_el) return;
    this.host_el.style.fontSize = `${BASE_FONT_PX * this.widgetStore.scale}px`;
};

const toggleOxygen = () => {
    const on = Number(this.$api.variables.get('L:var_OxygenOn', 'number')) >= 0.5;
    this.$api.variables.set('L:var_OxygenOn', 'number', on ? 0 : 1);
};

// One wheel notch = SCALE_STEP bigger (dir 1) or smaller (dir -1)
const resizeBy = (dir) => {
    const ws    = this.widgetStore;
    const scale = Math.round((ws.scale + dir * SCALE_STEP) * 100) / 100;
    ws.scale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale));
    applyScale();
    saveStore();
};

run(() => {
    this.widgetStore.manualHide = !this.widgetStore.manualHide;
    if (this.host_el) this.host_el.classList.toggle('visible', !this.widgetStore.manualHide);
});

loop_15hz(() => {
    if (!this.host_el) return;

    const ws       = this.widgetStore;
    const read     = (name) => Number(this.$api.variables.get(name, 'number')) || 0;
    const spo2     = Math.round(read('L:var_PulseOxyPercent'));
    const oxygenOn = read('L:var_OxygenOn') >= 0.5;
    const psi      = Math.round(read('L:var_OxygenPressure'));

    // Pulse oximeter
    if (spo2 !== ws.spo2) {
        ws.spo2 = spo2;
        this.spo2_el.textContent = Math.min(spo2, 99); // two-digit display
        this.oxi_el.classList.toggle('spo2-crit', spo2 < SPO2_CRIT);
        this.oxi_el.classList.toggle('spo2-low',  spo2 >= SPO2_CRIT && spo2 < SPO2_LOW);
        this.oxi_el.classList.toggle('spo2-mild', spo2 >= SPO2_LOW  && spo2 < SPO2_MILD);
    }

    // Oxygen lever: up = off, down = on
    if (oxygenOn !== ws.oxygenOn) {
        ws.oxygenOn = oxygenOn;
        this.lever_el.classList.toggle('oxygen-on',  oxygenOn);
        this.lever_el.classList.toggle('oxygen-off', !oxygenOn);
    }

    // Oxygen bottle
    if (psi !== ws.psi) {
        ws.psi = psi;
        const pct = Math.max(0, Math.min(100, psi / PSI_MAX * 100));
        this.fill_el.style.height = pct + '%';
        this.psi_el.textContent   = psi + ' PSI';
        this.bottle_el.classList.toggle('psi-crit', pct < PSI_CRIT_PCT);
        this.bottle_el.classList.toggle('psi-low',  pct >= PSI_CRIT_PCT && pct < PSI_LOW_PCT);
    }

    // Persist position if changed after a drag
    const posX = parseInt(this.host_el.style.left);
    const posY = parseInt(this.host_el.style.top);
    if (!isNaN(posX) && !isNaN(posY) && (posX !== ws.posX || posY !== ws.posY)) {
        ws.posX = posX;
        ws.posY = posY;
        saveStore();
    }
});

state(() => {
    return this.widgetStore.oxygenOn ? 'mdi:gas-cylinder:ON' : 'mdi:gas-cylinder:OFF';
});

style(() => {
    const { spo2, oxygenOn } = this.widgetStore;
    if (spo2 !== null && spo2 < SPO2_LOW) return 'error';
    return oxygenOn ? 'active' : null;
});

info(() => {
    const { spo2, oxygenOn, psi } = this.widgetStore;
    if (spo2 === null) return 'BKSQ Oxygen';
    return `O2 ${oxygenOn ? 'ON' : 'OFF'}<br>SpO2 ${spo2} %<br>${psi} PSI`;
});

html_created(el => {
    this.host_el   = el.querySelector('#Ape42_bksqo');
    this.oxi_el    = el.querySelector('.Ape42_bksqo_oxi');
    this.spo2_el   = el.querySelector('#Ape42_bksqo_spo2');
    this.lever_el  = el.querySelector('.Ape42_bksqo_lever');
    this.bottle_el = el.querySelector('.Ape42_bksqo_bottle');
    this.fill_el   = el.querySelector('#Ape42_bksqo_fill');
    this.psi_el    = el.querySelector('#Ape42_bksqo_psi');

    // Restore saved position
    if (this.widgetStore.posX !== null) {
        this.host_el.style.left = `${this.widgetStore.posX}px`;
        this.host_el.style.top  = `${this.widgetStore.posY}px`;
    }
    this.host_el.classList.toggle('visible', !this.widgetStore.manualHide);
    applyScale();

    // Resize with the mouse wheel over the widget
    let sawWheel = false;
    const onWheel = (e) => {
        if (e.type === 'wheel') sawWheel = true;
        else if (sawWheel) return; // 'mousewheel' fallback only if 'wheel' isn't fired
        const up = e.type === 'wheel' ? e.deltaY < 0 : e.wheelDelta > 0;
        resizeBy(up ? 1 : -1);
        e.preventDefault();
        e.stopPropagation();
    };
    this.host_el.addEventListener('wheel',      onWheel);
    this.host_el.addEventListener('mousewheel', onWheel);

    // Remember where the mouse went down, so a drag isn't taken as a click
    let downX = 0;
    let downY = 0;
    this.host_el.addEventListener('mousedown', (e) => {
        downX = e.clientX;
        downY = e.clientY;
    }, true);
    const wasDrag = (e) => Math.abs(e.clientX - downX) > DRAG_PX || Math.abs(e.clientY - downY) > DRAG_PX;

    // Clicks arrive with the widget itself as target (Flow's drag handling),
    // so hit-test the lever by coordinates instead of relying on e.target
    const onLever = (e) => {
        const r = this.lever_el.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };

    // Single click on the lever toggles oxygen (delayed, a double-click cancels it)
    this.host_el.addEventListener('click', (e) => {
        if (wasDrag(e) || !onLever(e)) return;
        clearTimeout(this.clickTimer);
        this.clickTimer = setTimeout(() => {
            this.clickTimer = null;
            toggleOxygen();
        }, DBLCLICK_MS);
    });

    // Double-click anywhere on the widget restores the default size
    this.host_el.addEventListener('dblclick', (e) => {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        this.widgetStore.scale = 1;
        applyScale();
        saveStore();
        e.stopPropagation();
    });
});

exit(() => {
    clearTimeout(this.clickTimer);
});

// Scrolling over the Flow tile resizes too
scroll((event) => {
    if (event.scroll) resizeBy(event.scroll > 0 ? 1 : -1);
});
