# 🌌 @slashand/sdui-blade-core

[![npm version](https://img.shields.io/npm/v/@slashand/sdui-blade-core.svg?style=flat-square)](https://npmjs.org/package/@slashand/sdui-blade-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> The Engine of the Infinite Interface. A framework-agnostic, Server-Driven UI (SDUI) orchestrator that reduces your frontend to a hollow glass shell, entirely commanded by declarative JSON manifests.

## 📖 Table of Contents
- [The Paradigm Shift](#the-paradigm-shift)
- [Architecture & Ubiquitous Language](#architecture--ubiquitous-language)
- [Installation](#installation)
- [Quickstart Usage](#quickstart-usage)
- [Contributing](#contributing)
- [License](#license)

## 🌌 The Paradigm Shift
The modern enterprise application requires interfaces that are highly modular, deeply contextual, and infinitely scalable without requiring constant frontend redeployments. Inspired by the Microsoft Azure "Blade" Architecture, `@slashand/sdui-blade-core` is the language-agnostic UI Engine at the center of the ecosystem.

It completely decouples the *what* from the *how*. The UI definition lives in the database. The frontend is merely a dumb interpreter that reads this Schema Payload and dynamically renders native UI components.

## 🏗️ Architecture & Ubiquitous Language
- **The Blade Context:** The current spatial and logical environment.
- **The Schema Payload:** A strictly typed JSON representation defining layout geometry, input types, validation rules, and data binding paths.
- **The Model (State Machine):** Powered by `zustand`, it handles the transient local data store (the mutations).
- **BladeInvokeControl:** The architectural magic. One blade can invoke another, yield a JSON object back, and populate the parent form seamlessly.

## 📦 Installation

```bash
npm install @slashand/sdui-blade-core zustand
```

## 🚀 Quickstart Usage

```typescript
import { createBladeStore, BladeAction } from '@slashand/sdui-blade-core';

// Initialize the vanilla TypeScript engine
const engine = createBladeStore({
  initialState: {
    bladeId: "UserConfigurationBlade",
    elements: [
       { id: "firstName", type: "TextField", label: "First Name", constraints: { required: true } }
    ]
  }
});

// Intercept agnostic UI dispatches (e.g. from React or Angular)
engine.subscribe((state) => {
  console.log("Blade State Transitioned: ", state.currentMutations);
});

// Hydrate the payload defensively
engine.getState().hydratePayload(awaitedJsonPayload);
```

## 🤝 Contributing
We adhere to standard open-source protocols. Check the repository for issues labeled `good first issue` or `help wanted`. Open a Pull Request for any architectural improvements.

## 🌟 Ecosystem Showcase
*Where can you see the Agnostic Blade System in action?*

- **Gravity English** (Coming Soon, March 2026) -> Educational Prompt-Orchestration Platform.
- **Coverlay Studio** (Coming Soon) -> Generative AI Non-Linear Video Editor.

*Live production applications utilizing these blades will be showcased here as their respective websites officially launch.*

## 🗺️ The Open-Source Singularity Roadmap
This matrix represents our path to total ecosystem capture.

### The Master Matrix
- [x] **React** (`@slashand/sdui-blade-react`)
- [x] **Angular** (`@slashand/sdui-blade-angular`)
- [ ] *Vue (`@slashand/sdui-blade-vue`)*
- [ ] *SvelteKit (`@slashand/sdui-blade-sveltekit`)*
- [ ] *SolidJS (`@slashand/sdui-blade-solid`)*
- [ ] *Next.js (Natively covered by React wrapper)*
- [ ] *Remix (Natively covered by React wrapper)*
- [ ] *Astro (Natively covered by React wrapper)*
- [ ] *Qwik (`@slashand/sdui-blade-qwik`)*
- [ ] *Three.js (`@slashand/sdui-blade-three`)*
- [ ] *React Native / Expo (`@slashand/sdui-blade-native`)*
- [ ] *HTMX (`@slashand/sdui-blade-htmx`)*
- [ ] *PixiJS (`@slashand/sdui-blade-pixi`)*

## 📜 License
Published under the [MIT License](LICENSE). Maintained by **Slashand Studio**.
