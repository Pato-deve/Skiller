<div align="center">

# Skiller

**The Skill Agent Delivery System**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/usuario/skiller)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

*Skiller is a high-performance interactive CLI designed to automate the provisioning of specialized instructions (Skills) for AI agents.*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Technical Stack](#technical-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [System Architecture](#system-architecture)
- [Available Scripts](#available-scripts)
- [Skill Database Management](#skill-database-management)
- [Configuration](#configuration)
- [License](#license)

---

## Overview

Skiller addresses the challenge of managing context and specialized instructions for Large Language Model (LLM) agents. By analyzing a project's technical stack, Skiller identifies and installs relevant "Skills"—standardized Markdown files containing optimized workflows, best practices, and guardrails—ensuring that your AI assistants operate with maximum precision and contextual awareness.

---

## Core Capabilities

- **Automated Stack Discovery**: Intelligent heuristic engine that analyzes `package.json` and directory structures to identify technologies (React, Node.js, TypeScript, etc.).
- **Interactive TUI**: A sophisticated Terminal User Interface with support for themes, internationalization (ES/EN), and optimized keyboard navigation.
- **Massive Skill Catalog**: Direct integration with a local database of over 1,000 production-ready skills.
- **Instant Provisioning**: Automated deployment of `SKILL.md` assets into the project's `.agents/skills/` directory.
- **Extensible Architecture**: Modular design pattern allowing for the seamless addition of new stack detectors and data sources.

---

## Technical Stack

- **Runtime**: Node.js (ECMAScript Modules)
- **Language**: TypeScript 5.x
- **Interface**: Native Readline + [Picocolors](https://github.com/alexeyraspopov/picocolors)
- **Build System**: TypeScript Compiler (tsc)
- **Configuration Storage**: Local JSON-based profile management

---

## Prerequisites

- **Node.js**: v20.0.0 or higher
- **Package Manager**: npm v9.0.0 or higher
- **Terminal**: ANSI-compliant terminal emulator (xterm-256color recommended)

---

## Installation

### 1. Repository Acquisition
```bash
git clone https://github.com/usuario/skiller.git
cd skiller
```

### 2. Dependency Resolution
```bash
npm install
```

### 3. Compilation
```bash
npm run build
```

---

## Usage Guide

To execute the CLI in a development environment:
```bash
npm run dev
```

### Keyboard Controls
| Key | Action |
| :--- | :--- |
| **Up / Down** | Navigate through the compatible skills list. |
| **Space** | Toggle selection for a specific skill. |
| **Right Arrow** | Quick navigation to the installation action. |
| **L** | Toggle language (Spanish / English). |
| **T** | Cycle through available UI themes. |
| **Enter** | Confirm and initiate skill provisioning. |
| **Ctrl + C** | Terminate process. |

---

## System Architecture

### Directory Structure
```text
skiller/
├── src/
│   ├── core/           # Business logic and domain services
│   │   ├── detector.ts # Stack discovery engine
│   │   └── skills.ts   # Database management and installation logic
│   ├── utils/          # Filesystem, configuration, and I18n utilities
│   └── index.ts        # Entry point and TUI orchestration
├── database/           # Local skill repositories
├── dist/               # Compiled JavaScript artifacts
└── package.json        # Metadata and dependency definitions
```

### Execution Lifecycle
1. **Analysis Phase**: The discovery engine scans the target directory to generate technology tags.
2. **Filtering Phase**: The skill service queries the local database and matches available skills against detected tags.
3. **Interactive Phase**: The TUI presents filtered results for user selection.
4. **Provisioning Phase**: Selected `SKILL.md` files are physically deployed to the target destination.

---

## Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Executes the application directly from source using `tsx`. |
| `npm run build` | Compiles the project into optimized JavaScript in the `dist/` directory. |

---

## Skill Database Management

Skiller utilizes a standardized repository format where each skill is contained within its own directory featuring a `SKILL.md` file with YAML frontmatter.

**Standard Location**: `C:\code\skiller\database\antigravity-awesome-skills\`

The `skills_index.json` file serves as the master catalog, providing metadata and physical path mapping for the discovery engine.

---

## Configuration

Skiller persists user preferences in a local configuration file.

**Path**: `~/.skiller/config.json`

Supported parameters:
- `lang`: Default interface language (`es` | `en`).
- `themeIdx`: Preferred color theme index.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
