# AGENTS.md

Vite + React 19 SPA for drilling Mandarin tone pairs. Entry: `src/main.tsx` → `src/App.tsx` (a screen state machine: loading → setup → quiz → results). Components live in `src/components/`.

## Commands (bun only — never npm/yarn)

- `bun run dev` — dev server (works with no env setup, see below)
- `bun run lint` — oxlint (config `.oxlintrc.json`); the only "lint"
- `bun run build` — the only typecheck: `tsc -b && vite build`, emits `dist/`
- `bun run preview` — serve `dist/`
- There is no test framework or test script.

## Dev env (optional)

The app falls back to relative paths (`./data.json`, `./audio`) in `src/config.ts`, and Vite's dev server serves both from the repo root, so `bun run dev` works with no `.env.local`. To load data/audio from an external host instead, copy `.env.example` to `.env.local` and set both:

- `VITE_DATA_URL` (e.g. `http://localhost:8000/data.json`)
- `VITE_AUDIO_BASE_URL` (no trailing slash, e.g. `http://localhost:8000/audio`)

If you override to a cross-origin host, it must send CORS headers or the browser blocks the fetch (e.g. `bunx serve . -l 8000 --cors`). `.env.local` is gitignored; the committed CI env is the dotfile `.github/workflows/.env`, which the deploy workflow copies to `.env`.

## Deploy

`.github/workflows/github-pages.yml` deploys to GitHub Pages on push to `master`/`main`. It checks out the `sihanki/audio-cmn` fork (note: fork, not the `hugolpz/audio-cmn` repo the README credits), copies `audio-cmn/96k/hsk` → `public/audio` and `data.json` → `public/`, then builds. `vite.config.ts` sets `base: "./"` for subpath deployment. Audio filenames are `cmn-{hanzi}.mp3`. The repo-local `audio/` dir is untracked and not committed.

## TypeScript strictness (build-breaking)

- `verbatimModuleSyntax: true` → type-only imports MUST use `import type` (codebase already follows this).
- `erasableSyntaxOnly: true` → no enums, namespaces, or class parameter properties.
- `noUnusedLocals` / `noUnusedParameters` on → unused vars fail the build.
- Style: no semicolons, single quotes, 2-space indent (no prettier config — match existing files).

## Data model

- `data.json` is an array of `{ expression, audio, pinyin, pattern }`; `pattern` is `"{first} {second}"` with first tone ∈ 1–4 and second tone ∈ 1–4 or 0 (neutral).
- Known quirk: one entry has pattern `0 3` (first tone 0), which the UI grid (`src/data.ts` `FIRST_TONES` = 1–4) cannot select — leave it; it's just unreachable.
- Question generation/allocation: `src/questions.ts`; pattern constants: `src/data.ts`; tone diacritic marking: `src/pinyin.ts`; env wiring: `src/config.ts`.

## Keyboard input

Setup has an "Enable keyboard input" checkbox; `SetupScreen.tsx` `onStart` passes `keyboardEnabled: boolean` through `App.tsx` to `QuizScreen.tsx`. When enabled, an auto-focused text input appears below the tone buttons (refocused on each question). Keys: `1–4` sets the first tone (same as clicking its button), `0–4` sets the second and reveals, `Backspace` clears the last digit (if not revealed), `Enter` advances after reveal. The input is `readOnly` after reveal; all key logic lives in `QuizScreen.tsx` `handleInputKeyDown`. Mouse and keyboard selection share the same state.

## Regenerating data.json (one-off, unscripted)

Two Python scripts with hardcoded relative paths (run from repo root), not wired into package.json:

1. `1-parse-cedict.py` — reads `./data/cedict_1_0_ts_utf-8_mdbg.txt`, writes `cedict_tabs.txt`
2. `2-build-json.py` — reads `cedict_tabs.txt` + `data/audio`, writes `words.json` (NOT `data.json` — rename/move manually)

Only 2-syllable words with an audio file under `data/audio` are kept; cedict tone 5 is normalized to 0 (neutral).
