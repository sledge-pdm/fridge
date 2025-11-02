# Fridge AI Coding Agent Instructions

## Project Overview
Fridge is a **Tauri-based text editor** built with **SolidJS + TypeScript** frontend and **Rust** backend. It's transitioning from textarea to a rich editor using **TipTap** with plans for AST-based document representation for flexible rendering (including vertical text).

## Architecture

### Monorepo Structure (pnpm workspaces)
- **`apps/fridge/`** - Main Tauri app
- **`packages/core/`** - Shared types and utilities  
- **`packages/theme/`** - CSS custom properties theming system
- **`packages/ui/`** - Reusable UI components

### Key Technologies
- **Frontend**: SolidJS (not React), Vite, @acab/ecsstatic for CSS-in-JS
- **Backend**: Tauri v2, Rust with file I/O and window management
- **Editor**: TipTap extensions, solid-tiptap adapter
- **Testing**: Vitest with browser mode (Playwright)
- **Bundler**: pnpm, specific to Tauri dev workflow

## Critical Workflows

### Development Commands
```bash
pnpm dev          # Start Tauri dev mode (frontend + backend)
pnpm build        # Production Tauri build
pnpm test         # Run Vitest browser tests
pnpm format       # Run prettier + cargo fmt
```

### File Operations Pattern
- Use **Tauri plugins** (@tauri-apps/plugin-fs, plugin-dialog) for file I/O
- Files opened via Rust backend (`handle_file_associations`) 
- State persistence through `features/io/editor_state/` save/load

### Frontend State Management
- **Stores**: `stores/EditorStore.ts` (documents, sidebar, search states)
- **Services**: `features/document/service.ts` (document CRUD operations)
- **Event Bus**: `utils/EventBus.ts` using `mitt` for cross-component communication

## Project-Specific Patterns

### Styling with @acab/ecsstatic
```tsx
import { css } from '@acab/ecsstatic';

const styles = css`
  color: var(--color-on-background);
  background: var(--color-surface);
`;

// Apply with class={styles}
```

### Theme System
- CSS custom properties in `packages/theme/src/Theme.ts`
- OS theme detection + manual themes (light/dark/black variants)
- Use `applyTheme()` function, never direct CSS manipulation

### Document Management
- `FridgeDocument` class for document abstraction
- Tab-based multi-document editing
- Auto-save with debouncing via `saveEditorState()`

### TipTap Integration
- Custom extensions in `components/editor/tiptap/`
- Invisible character rendering (full/half-width spaces)
- SolidJS reactive bindings through `solid-tiptap`

## Component Architecture

### Feature-Based Structure
```
src/
├── components/     # UI components (editor, sidebar, title_bar)
├── features/       # Domain logic (document, io, search)
├── routes/         # SolidJS Router pages
├── stores/         # Global state management
└── utils/          # Cross-cutting utilities
```

### SolidJS Patterns
- Use `createEffect()` for reactive side effects
- `createStore()` from solid-js/store for complex state
- Prefer signals over useState patterns from React

## File System Integration
- **Rust side**: File scope management in `lib.rs`
- **Frontend**: Tauri API calls for file operations
- **Path handling**: Use `utils/FileUtils.ts` for cross-platform paths

## Testing Approach
- Browser-based testing with Playwright
- Mock `@acab/ecsstatic` in `vitest.setup.ts` 
- Test files in `apps/fridge/test/`

## Common Gotchas
1. **Never use React patterns** - this is SolidJS (different reactivity model)
2. **Tauri v2 API** - Use plugin system, not direct fs/dialog APIs
3. **CSS-in-JS scope** - Always import `css` from @acab/ecsstatic
4. **Path aliases** - Use `~/` for app src, `@sledge/` for packages
5. **pnpm workspaces** - Install deps with `pnpm add -F [workspace]`

## Current Development Focus
- Migrating from textarea to TipTap contenteditable editor
- AST document representation for flexible paragraph rendering
- Vertical writing mode support
- Series writing features (scratchpad, timeline, wiki)