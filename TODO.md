# Skiller - Roadmap & TODOs

## Phase 1: Core CLI & Local Engine (Current)
- [x] Initialize project structure (Node.js + TS).
- [x] Design and implement the Immersive Terminal UI (TUI) without heavy dependencies.
- [x] Create scalable heuristic detection engine (Dependency & Structure Matchers).
- [ ] **Pending:** Implement the actual file writing logic. Create `.agents/skills/` directory and write the selected Markdown files to the disk.
- [ ] **Pending:** Add content logic for the Mock skills (currently only generating empty or generic files).

## Phase 2: Remote Registry & Synchronization
- [ ] Define the JSON schema for the remote skills index.
- [ ] Implement the `check-on-run` sync mechanism (check `last_update_timestamp` in `~/.skiller/metadata.json`).
- [ ] Fetch from remote CDN/GitHub repository.
- [ ] Parse remote skills and feed them into the TUI dynamically instead of using `MOCK_SKILLS_DB`.

## Phase 3: Scale Heuristics
- [ ] Create `PythonMatcher`: Read `requirements.txt` / `Pipfile` / `pyproject.toml` (Django, FastAPI, Flask, Pandas).
- [ ] Create `GoMatcher`: Read `go.mod` (Gin, Fiber).
- [ ] Create `RustMatcher`: Read `Cargo.toml` (Actix, Axum).
- [ ] Broaden structural heuristics to detect monorepos (e.g., `apps/`, `packages/`, `turbo.json`).

## Phase 4: Refinement & UX
- [ ] Handle permissions and Edge cases (e.g., what if `.agents/skills/` is read-only?).
- [ ] Allow overriding detected tags via a command-line flag (e.g., `skiller --tags "rust,backend"`).
- [ ] Compile to a standalone binary using Vercel `pkg` or similar for distribution without requiring a global `npm install`.