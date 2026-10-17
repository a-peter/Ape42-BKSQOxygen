# BKSQ Oxygen — Flow Pro Widget

A widget for [Flow Pro](https://parallel42.com) by Parallel 42 that shows the oxygen system of the **Black Square Caravan Professional**, the **Black Square Bonanza Professional**, the **Black Square Baron** and the **Black Square Commander** in Microsoft Flight Simulator.

The Commander 114 (without TC) and the pressurized Baron 58P have no oxygen lever: the widget still shows the pulse oximeter, while lever and bottle are dimmed and marked "Not available" in red with a note which variant has oxygen; clicking the lever does nothing.

## Features

- **Pulse oximeter** (left): green LCD with 7-segment digits showing blood oxygen saturation in %, rounded to whole numbers. The LCD backlight follows clinical thresholds: green ≥ 95 %, yellow 90–94 % (mild hypoxemia), orange 85–89 % (moderate), red below 85 % (severe).
- **Oxygen lever** (middle), styled after the loaded aircraft:
  - Caravan Professional: ivory cylinder grip sliding vertically in a slot — up = OFF, down = ON.
  - Bonanza Professional: chrome toggle switch with hex nut on the black panel, labelled "OXYGEN" — up = ON, down = OFF, as in the aircraft.
  - Baron: the Commander's knob and rod on a dark panel with an "OXYGEN / PULL ON" placard — up = OFF, down = ON.
  - Commander: black knob on a chrome rod (pushed in = OFF, pulled out = ON) on a brushed metal plate labelled "OXYGEN SYSTEM" — up = OFF, down = ON.
- **Oxygen bottle** (right): fill level and pressure in PSI (full = 1850 PSI, Bonanza and Baron 2150 PSI). Amber below 25 %, red below 10 %.
- Click the Flow tile to show/hide the overlay.
- Drag the overlay to reposition it — the position is saved automatically.
- Use the mouse wheel over the overlay (or over the Flow tile) to resize it — the size is saved automatically.
- Click the lever to switch the oxygen supply on/off.
- Double-click the overlay to restore the default size.

## Variables

| Display | Variable | Range |
|---------|----------|-------|
| SpO₂ | `L:var_PulseOxyPercent` | 0 – 100 |
| Lever (Caravan / Bonanza Professional) | `L:var_OxygenOn` | 0 = off, 1 = on |
| Lever (Commander 114TC) | read `B:PASSENGER_CABIN_HEAT_5`, set `B:PASSENGER_CABIN_HEAT_5_Set` | 0 = off, 100 = on |
| Lever (Baron) | read `B:PASSENGER_CABIN_HEAT_1`, set `B:PASSENGER_CABIN_HEAT_1_Set` | 0 = off, 100 = on |
| Bottle | `L:var_OxygenPressure` | 0 – 1850 PSI (Bonanza, Baron 0 – 2150) |

The lever variable and look are chosen by the aircraft title (`A:TITLE`): "Black Square Commander 114TC" uses the B-variables, any other "Black Square Commander" has no oxygen system, "Black Square Baron 58P" neither, any other "Black Square Baron" uses `PASSENGER_CABIN_HEAT_1` with the Commander's knob on a dark panel ("OXYGEN / PULL ON"), "Black Square" + "Bonanza Professional" (any variant, e.g. B36TP) the toggle switch look, anything else the Caravan Professional.

## Installation

1. Download the latest `.zip` from the [Releases](../../releases) page.
2. Quit Microsoft Flight Simulator.
3. Extract the zip into your MSFS **Community** folder.
4. Start the sim, open Flow Pro — the widget appears in the Community section of the editor.

## Development

- **In the sim:** set the Flow script editor's *Working Directory* to this folder; `code.js`, `code.html` and `code.css` sync on save.
- **In a browser:** `node dev/server.js` and open <http://localhost:8642/> — a mock of the Flow runtime with sliders for the three variables.

## Building from source

Requires Node.js.

```bash
node .github/scripts/build.js "1.0.0"
```

The built package is written to `dist/p42-util-flow-ape42_3060-bksqoxygen/`.

A GitHub Actions workflow automatically builds and publishes a release when a version tag is pushed:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

[MIT](LICENSE)

The SpO₂ display uses the font **DSEG7 Modern Bold Italic** by [keshikan](http://www.keshikan.net) (Reserved Font Name "DSEG"), licensed under the [SIL Open Font License 1.1](fonts/DSEG-LICENSE.txt). It is embedded unmodified in `code.css`; the source file is in [`fonts/`](fonts).
