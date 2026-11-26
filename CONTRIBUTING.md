# Contributing to Techfest IITB Parallax

Thanks for your interest in contributing! This project is an interactive 3D
WebGL experience in strict manga monochrome — pure ink, halftone screentones,
zero gradients. Please keep that art direction intact in visual contributions.

## Getting Started

```bash
git clone https://github.com/mantisdarling/Techfest-IITB-Parallax.git
cd Techfest-IITB-Parallax
npm install
npm run dev
```

## Scripts

| Command              | Purpose                         |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start the Vite dev server       |
| `npm run build`      | Production build                |
| `npm run preview`    | Preview the production build    |
| `npm run lint`       | Lint with oxlint                |
| `npm run typecheck`  | Strict TypeScript check (`tsc`) |
| `npm test`           | Run the Vitest suite once       |
| `npm run test:watch` | Watch-mode tests                |
| `npm run format`     | Format everything with Prettier |

## Development Rules

- **TypeScript only.** All source lives in `src/` as `.ts` / `.tsx` with strict
  mode enabled. Define interfaces in `src/types.ts` for shared shapes.
- **Keep the 3D scene modular.** Pure math (formations, maze, camera path)
  lives in `src/three/*.ts` without Three.js imports where possible, so it can
  be unit-tested. Scene construction lives in `src/three/realms.ts` and
  `src/three/scene.ts`; per-frame updates in `src/three/animation.ts`.
- **Keep UI components small.** HUD pieces, modals, and minigame widgets live
  in `src/components/`; stateful logic belongs in custom hooks (`src/hooks/`).
- **Monochrome art direction.** Only `#000000`, `#FFFFFF`, `#111111` and
  halftone patterns. No gradients, no color.
- **Add tests** for new pure logic and user-facing flows. CI runs lint,
  typecheck, tests, and build on every PR.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(realms): add fifth chapter
fix(audio): resume suspended context on iOS
test(formations): cover helix radius invariant
```

A husky pre-commit hook runs oxlint and Prettier on staged files automatically.

## Pull Requests

1. Fork and create a branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Make your change with tests; run `npm run lint && npm run typecheck && npm test`.
3. Open a PR describing the change and how you verified it (screenshots/GIFs
   welcome for visual changes).
4. CI must be green before merge.

## Reporting Bugs & Security Issues

- Bugs: open a GitHub issue with reproduction steps and browser/OS details.
- Security: follow [SECURITY.md](SECURITY.md) — never file public issues for
  vulnerabilities.
