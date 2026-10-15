# BKSQ Oxygen — Flow Pro Widget

A widget for [Flow Pro](https://parallel42.com) by Parallel 42 that shows the oxygen system of the **Black Square Caravan 208** in Microsoft Flight Simulator.

## Features

- **Pulse oximeter** (left): blood oxygen saturation in %, rounded to whole numbers. Amber below 90 %, red below 80 %.
- **Oxygen lever** (middle): ivory grip on a black metal lever — up = OFF, down = ON.
- **Oxygen bottle** (right): fill level and pressure in PSI (full = 1850 PSI). Amber below 25 %, red below 10 %.
- Click the Flow tile to show/hide the overlay.
- Drag the overlay to reposition it — the position is saved automatically.

## Variables

| Display | Variable | Range |
|---------|----------|-------|
| SpO₂ | `L:var_PulseOxyPercent` | 0 – 100 |
| Lever | `L:var_OxygenOn` | 0 = off, 1 = on |
| Bottle | `L:var_OxygenPressure` | 0 – 1850 PSI |

## Installation

1. Download the latest `.zip` from the [Releases](../../releases) page.
2. Quit Microsoft Flight Simulator.
3. Extract the zip into your MSFS **Community** folder.
4. Start the sim, open Flow Pro — the widget appears in the Community section of the editor.

> **MSFS 2024:** The folder name must additionally be registered in Flow Pro. Refer to the official Flow Pro documentation for details.

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
