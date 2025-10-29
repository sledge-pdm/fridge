# Copilot Instructions for Fridge

## Overview
Fridge is a monorepo for a Tauri v2-based text editor, using SolidJS and Vite. The main app is in `apps/fridge`. The project is modular, with shared packages in `packages/` (e.g., `core`, `theme`, `ui`).

## Architecture
- **Frontend**: SolidJS SPA, entrypoint `apps/fridge/src/main.tsx` and `app.tsx`.
- **State Management**: Uses SolidJS signals and stores (see `stores/`).
- **Document Model**: Documents are managed by `DocumentsManager` (`features/document/DocumentsManager.ts`), with state updates via an event bus (`utils/EventBus.ts`).
- **Search**: Document search logic is in `features/search/Search.ts` and UI in the sidebar. Search results are highlighted using `features/markup/SpanMarkup.ts`.
- **Styling**: Uses CSS-in-JS via `@acab/ecsstatic` and global CSS from `@sledge/theme`.
- **Tauri Integration**: File I/O and window management use Tauri APIs (see `features/io/`, `utils/WindowUtils.ts`).

## Developer Workflows
- **Install**: Use `pnpm` (enforced by `preinstall` script).
- **Dev Server**: `pnpm dev` (runs Tauri app with Vite frontend).
- **Build**: `pnpm build` (Tauri build).
- **Test**: `pnpm test` or `vitest` (see `vitest.config.ts`).
- **Lint/Format**: `pnpm prettier`, `pnpm stylelint`.
- **CI/CD**: See `.github/workflows/` for build/release triggers and artifact handling.

## Project Conventions
- **Path Aliases**: Use `~` for `apps/fridge/src`, `@sledge/*` for packages (see Vite config).
- **Component Structure**: UI components in `components/`, features in `features/`, state in `stores/`.
- **Event Bus**: Use `eventBus` for cross-component communication (document changes, active doc, etc).
- **Search/Highlight**: Use `SpanMarkup` for overlay rendering and search result highlighting.
- **Theme**: Theme switching via `@sledge/theme` and `ThemeDropdown`.

## Examples
- To add a new document: use `documentsManager.addDocument()`.
- To update document content: call `documentsManager.updateActive({ content })`.
- To trigger a search: update the search input in the sidebar; results update via event bus and are highlighted in the editor.

## References
- Main app: `apps/fridge/`
- Shared packages: `packages/`
- Build/test config: `package.json`, `vitest.config.ts`, `vite.config.js`
- CI: `.github/workflows/`

---
For more details, see the README files and in-code comments. If any section is unclear or missing, please provide feedback for improvement.
