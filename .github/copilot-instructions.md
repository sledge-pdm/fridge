<!-- Guidance for AI coding agents working on the Fridge repository -->

# Fridge — quick agent guide

This file gives targeted, repository-specific instructions to help an AI coding agent be immediately productive.

1. High-level architecture
   - Frontend: a SolidJS application under `apps/fridge/src` (entry: `src/main.tsx`, app root: `src/app.tsx`). UI is split into `components/`, `features/`, `stores/`, and `utils/`.
   - Desktop host: Tauri backend in `apps/fridge/src-tauri` (Rust). The Tauri config is `apps/fridge/src-tauri/tauri.conf.json` and Rust sources are in `apps/fridge/src-tauri/src` (entry: `lib.rs`).
   - Packages: shared code lives in `packages/*` (e.g., `@sledge/core`, `@sledge/theme`, `@sledge/ui`). Vite maps these with aliases in `apps/fridge/vite.config.js` (`~`, `@sledge/*`).

2. Important workflows / commands
   - Use pnpm workspace commands from repo root. Common scripts in root `package.json`:
     - `pnpm dev` -> launches `apps/fridge` in tauri dev (runs `pnpm -F fridge dev`).
     - `pnpm build` -> builds the `fridge` app via tauri build.
     - `pnpm test` -> runs vitest tests.
     - `pnpm tsc` -> checks TypeScript across the monorepo (no emit).
   - App-level scripts (`apps/fridge/package.json`):
     - `pnpm -w vite:dev` / `pnpm -F fridge vite:dev` for running Vite only.
     - `pnpm -F fridge dev` runs `tauri dev` — ensure `pnpm vite:dev` is reachable on port 5174 (configured in `vite.config.js` and `tauri.conf.json`).

3. Project conventions and patterns
   - Aliases: imports often use `~` for `apps/fridge/src` and `@sledge/*` for local packages. Check `apps/fridge/vite.config.js` for alias resolution.
    - UI layering: editor rendering separates a content DOM and an overlay DOM (see `src/components/editor/EditorTextArea.tsx`). The overlay is used for markup/visual overlays; parsing flows go through `features/document/parser` and `features/document/service`.
    - Editor WYSIWYG contract (important): the editor's visible state is maintained by round-tripping between DOM and AST.
       - Rendering: `parseHTML(doc, { docElId, overlay })` is used to produce the content DOM and overlay DOM from a `FridgeDocument` (AST).
       - Parsing: `parseDocFromDOM(el)` converts the current DOM back into a `FridgeDocument`.
       - Selection & composition: updates preserve selection (`saveSelection` / `restoreSelection`) and respect IME composition (`onCompositionStart` / `onCompositionEnd`) to avoid disrupting user typing.
       - Contract to preserve when editing: any change to the editor rendering or parser must keep these properties: id stability for nodes (avoid cloning ids), deterministic parse->render round-trip, and non-destructive selection restoration.
   - Stores: app state uses SolidJS `createStore` wrappers exported from `apps/fridge/src/stores/*` (examples: `EditorStore.ts`, `ConfigStore.ts`). Update store shape carefully — other components import these directly.
   - AST/document model: the editor is moving from textarea-based text towards an AST document model (`features/document/models`, `features/document/parser`, and `utils/ASTUtils.ts` which contains node id generation). Tests or features may expect `FridgeDocument` methods like `toPlain()`.
   - Composition handling: text composition (IME) is handled explicitly in `EditorTextArea.tsx` via composition events — preserve that logic when changing editor input handling.

4. Cross-language & integration tips
   - Frontend ↔ Rust: Tauri commands/invocations are defined in `apps/fridge/src-tauri/src` and wired by `tauri.conf.json`. When changing API surface, update both `invoke_handler!` in Rust and frontend calls to `@tauri-apps/api` or generated invocations.
   - Asset protocol and FS: The Rust side uses `tauri_plugin_fs` and exposes file allowances for `asset:` protocol. If modifying file-open workflows, check `src-tauri/src/lib.rs` and `src-tauri/src/window.rs` for `allow_file` usage.

5. Testing & linting
   - Unit tests use Vitest (root `vitest.config.ts`, `vitest.setup.ts`). Run with `pnpm test` from repo root.
   - Type-checking across monorepo: `pnpm tsc` (root script) runs `tsc --noEmit --skipLibCheck` for all packages.
   - Rust formatting: `pnpm cargo:format` runs `cargo fmt` inside `apps/fridge/src-tauri`.

6. Quick examples (when editing code)
    - Modify editor rendering: example file `apps/fridge/src/components/editor/EditorTextArea.tsx` — content and overlay are separate DOM roots with ids `editor-doc-el` and `editor-doc-overlay-el`. The component intentionally keeps a WYSIWYG contract by round-tripping DOM <-> AST. When changing DOM markup you must:
       1. Update `features/document/parser` so `parseDocFromDOM` still reconstructs the same AST shape.
       2. Ensure `parseHTML` emits nodes with stable IDs (do not create duplicate ids on Enter or node reflow).
       3. Preserve IME composition semantics and selection using `saveSelection`/`restoreSelection`.
       4. Add tests that verify a parse(render(doc)) -> parse round-trip keeps node ids and text content.
   - Change theme behavior: theme helpers live in `packages/theme/src/Theme.ts` and `apps/fridge/src/app.tsx` calls `applyTheme`. Use `applyTheme` and `watchOSTheme` helpers instead of manually rewriting CSS variables.
   - Add a new UI component: use alias `~` imports, register CSS in `packages/theme/src/global.css` or local `appGlobal.css`, and add routes in `apps/fridge/src/app.tsx`.

7. Common pitfalls to avoid
   - Don't break the `vite` dev port (5174) or strictPort setting — `tauri dev` expects the same port configured in `tauri.conf.json`.
   - When changing stores, search for direct imports (not only hook usage): components import `editorStore` and `configStore` directly; updates to API must be backward-compatible.
   - Editor composition/IME: changing input flow can break IME support if you remove composition start/end handling.
   - Rust/TS types: changing Tauri invoke signatures requires syncing both sides — keep `tauri.conf.json` and Rust `invoke_handler!` consistent.

8. Where to look first
   - `apps/fridge/src` — app entry, components, features, stores
   - `apps/fridge/src-tauri` — Rust integration, file handling, window management
   - `apps/fridge/vite.config.js` — aliases, optimizeDeps, server port
   - `packages/theme` and `packages/core` — shared utilities and styling conventions

If anything above is unclear or you want more examples (e.g., show how to add a new route, add a Tauri invoke, or run a focused test), tell me which area and I'll expand the doc with exact code snippets and commands.
