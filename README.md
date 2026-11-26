# TECHFEST IIT BOMBAY: 3D MANGA CHRONICLES

[![CI](https://github.com/mantisdarling/Techfest-IITB-Parallax/actions/workflows/ci.yml/badge.svg)](https://github.com/mantisdarling/Techfest-IITB-Parallax/actions/workflows/ci.yml)
[![CodeQL](https://github.com/mantisdarling/Techfest-IITB-Parallax/actions/workflows/codeql.yml/badge.svg)](https://github.com/mantisdarling/Techfest-IITB-Parallax/actions/workflows/codeql.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

> **Asia's Largest Science & Technology Festival**: An interactive 3D WebGL experience built in strict Japanese manga monochrome (pure ink, halftone screentones, crosshatching, zero AI, zero gradients).

## ⚡ Core Highlights

- **Strict Manga Monochrome Art Direction**: Pure `#000000` ink, `#FFFFFF` paper, `#111111` charcoal, and authentic halftone screentone dot patterns.
- **Continuous 3D Camera Flight**: Scroll smoothly along the Z axis from `Z: +400m` to `Z: -1800m` across 4 competition realms.
- **Playable 30nm Maze Rover**: Steer the autonomous micro rover using `WASD`, Arrow keys, or the mobile touch DPad to reach the checkpoint beacon.
- **500 Drone Swarm Morphing**: Real time 3D vector interpolation between 4 formations:
  - `01 // POKÉBALL ORB`
  - `02 // TECHFEST 'TF' CREST`
  - `03 // IIT BOMBAY FALCON`
  - `04 // QUANTUM DOUBLE HELIX`
- **Technoholix DJ Synth Matrix**: Procedural Web Audio 4 pad synthesizer (Kick, Hi Hat, Synth Lead, Sub Bass Drop) with an automated beat sequencer that pulses 3D monolith towers.
- **Camera Perspectives**:
  - `SCROLL 3D`: Storyline depth progression.
  - `COCKPIT`: First Person 90s mecha visor HUD with target lock reticle, radar telemetry, and speed readouts.
  - `FPV DRONE`: Free flight aerial exploration above Mumbai's skyline.
  - `360° ORBIT`: Continuous orbital overview of festival grounds.
- **Interactive Campus Venue Map**: 3D directory of IIT Bombay venues (Gymkhana Grounds, Convocation Hall, OAT, SAC Lawns).
- **Personalized Manga Cyber Pass Generator**: Customize and generate an authentic manga boarding ticket with QR code verification and barcode.

## 🎮 Controls

- **Scroll Realms**: Mouse Wheel / Touch Scroll
- **Steer Rover**: `W` `A` `S` `D` / Arrow Keys / On screen DPad
- **3D Rotate / Drag**: Click + Drag on Canvas
- **Trigger SFX**: Click Onomatopoeia Badges (`ドォォン!`, `ガガガッ!`)
- **Camera View**: Select `SCROLL`, `COCKPIT`, `FPV`, or `ORBIT` in Header
- **Deep Links**: `?realm=0..3`, `#gateway|robowars|drones|stage`, `?dossier=<realm-id>`

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite + TypeScript (strict)
- **3D Graphics Engine**: Three.js (WebGL), lazy-loaded via code splitting
- **Icons**: Lucide React
- **Audio**: Procedural Web Audio API
- **Typography**: Dela Gothic One, Syne, Space Grotesk, JetBrains Mono
- **Quality**: Vitest + Testing Library, oxlint, Prettier, husky pre-commit hooks, GitHub Actions CI + CodeQL, Dependabot

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mantisdarling/Techfest-IITB-Parallax.git

# Navigate to project directory
cd Techfest-IITB-Parallax

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🧰 Development Scripts

| Command              | Purpose                      |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start the Vite dev server    |
| `npm run build`      | Production build             |
| `npm run preview`    | Preview the production build |
| `npm run lint`       | Lint with oxlint             |
| `npm run typecheck`  | Strict TypeScript check      |
| `npm test`           | Run the Vitest suite         |
| `npm run test:watch` | Watch-mode tests             |
| `npm run format`     | Format with Prettier         |

## 📁 Project Structure

```
src/
├── App.tsx              # Composition root: hooks + components
├── ThreeScene.tsx       # Thin React wrapper around the WebGL scene
├── components/          # HUDs, realm sections, modals, error boundary
├── hooks/               # useAudioSynth, useScrollTracking, useRoverControls,
│                        # useDjSequencer, useModals
├── three/               # Scene modules: realm builders, formations, maze,
│                        # camera path, animation loop, drag input
├── lib/                 # Pure utilities: scroll math, URL parsing, keyboard,
│                        # audio presets
├── data/                # Realm & venue content
└── types.ts             # Shared TypeScript interfaces
```

## 🧪 Testing

Unit tests cover the pure 3D math (drone formations, maze goal detection,
camera path), scroll/URL/keyboard utilities, and the modal state reducer.
Integration tests (Testing Library + jsdom) cover the main user flows: sound
toggle, campus map, dossier → pass generator, formation switching, and cockpit
mode.

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the
development workflow, coding rules, and commit conventions. Security issues
should follow [SECURITY.md](SECURITY.md).

## 📜 License & Credits

Licensed under the [Apache License 2.0](LICENSE).

Techfest IIT Bombay © 2026. Asia's Largest Science & Technology Festival.
Patronage: UNESCO, UNICEF, Make in India.
