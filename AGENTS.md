# Skiller: Architecture & Design Document

## 1. Executive Summary
`skiller` is a Command Line Interface (CLI) utility designed to automate the discovery of a project's technology stack. Based on this analysis, it interactively recommends and provisions context-aware "skills" (behavioral instructions) for AI agents, streamlining the configuration of local agentic workflows.

## 2. User Execution Flow
The standard operational pipeline follows a sequential, user-validated approach:
1. **Invocation:** The user initiates the setup process via the CLI entry point directly in the root of their project.
2. **Context Detection (Heuristics):** The tool performs an automated scan using fuzzy logic and heuristic matchers to infer the environment (e.g., detecting a database if `mongoose` is present, or identifying frontend via `src/app`).
3. **Skill Selection (Immersive TUI):** An interactive, immersive full-screen Terminal UI (TUI) is presented. It displays the detected stack and allows the user to navigate and select relevant agent skills.
4. **Provisioning:** The chosen skills are generated as localized artifacts within the project's agent configuration directory (e.g., `.agents/skills/`).

## 3. Technical Decisions & System Architecture

### 3.1 Stack Detection Strategy (Heuristic Engine)
- **Approach:** A modular, scalable "Matcher" architecture. The engine executes multiple independent evaluators in parallel:
  - **Dependency Matcher:** Analyzes package manifests (`package.json`, etc.) using fuzzy logic (e.g., mapping `prisma` to `['database', 'backend']`).
  - **Structure Matcher:** Scans directory layouts and configuration files (e.g., identifying `src/app` or `Dockerfile`).
- **Rationale:** Fuzzy logic allows for broader categorization (`web-design`, `infrastructure`) rather than strict 1:1 framework matching, improving skill recommendations.

### 3.2 Terminal User Interface (TUI)
- **Approach:** A custom-built, dependency-free interactive prompt system utilizing Node.js native `readline`, `process.stdin` raw mode, and ANSI escape codes.
- **Features:** 
  - **Immersive Mode:** Uses alternate screen buffers (`\x1B[?1049h`) and hides the cursor (`\x1B[?25l`) to create a native app-like experience (similar to `htop` or `lazygit`).
  - **Performance:** Ensures instant transitions and prevents cluttering the user's terminal history during the selection phase.

### 3.3 Artifact Generation
- **Format:** Markdown (`.md`) files.
- **Location:** `.agents/skills/` relative to the project root.
- **Rationale:** Markdown is the optimal format for structuring context and instructions intended for consumption by Large Language Models (LLMs).

### 3.4 Registry & Synchronization (Planned)
- **Sync Strategy:** "Check-on-Run" synchronization.
- **Mechanism:** The CLI reads a local metadata file tracking the timestamp of the last successful sync. If the delta exceeds 24 hours, a synchronous fetch retrieves the latest skill index from the registry before presenting options. 
- **Central Registry:** A centralized remote repository serving a compiled JSON index of available skills, curated via CI/CD pipelines scraping authoritative sources.