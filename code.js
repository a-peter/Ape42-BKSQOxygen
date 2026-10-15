// Version 0.1.0
// Author: Ape42

const PSI_MAX       = 1850; // full bottle
const SPO2_LOW      = 90;   // amber below this
const SPO2_CRIT     = 80;   // red below this
const PSI_LOW_PCT   = 25;   // amber below this fill level
const PSI_CRIT_PCT  = 10;   // red below this fill level

this.host_el   = null;
this.oxi_el    = null;
this.spo2_el   = null;
this.lever_el  = null;
this.bottle_el = null;
this.fill_el   = null;
this.psi_el    = null;

this.widgetStore = {
    // Widget position (persisted)
    posX: null,
    posY: null,
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
        this.spo2_el.textContent = spo2;
        this.oxi_el.classList.toggle('spo2-crit', spo2 < SPO2_CRIT);
        this.oxi_el.classList.toggle('spo2-low',  spo2 >= SPO2_CRIT && spo2 < SPO2_LOW);
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
        this.$api.datastore.export({ posX: posX, posY: posY });
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
    return `SpO2 ${spo2} %\nO2 ${oxygenOn ? 'ON' : 'OFF'}\n${psi} PSI`;
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
});
