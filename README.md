# @slashand/sdui-blade-core
> The Agnostic Engine for Horizontal "Journey" Orchestration

[![npm version](https://img.shields.io/npm/v/@slashand/sdui-blade-core.svg)](https://www.npmjs.com/package/@slashand/sdui-blade-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SDUI Blade Core** is an enterprise-grade, framework-agnostic state machine and orchestration engine for building complex, horizontally scrolling "Blade" interfaces. It acts as the mathematical brain behind fluid, non-blocking UI navigation flows without forcing you into a single frontend framework.

## The Philosophy

We believe the traditional "Modal Window" is an architectural anti-pattern for sophisticated enterprise applications. Modals destroy context and confine the user. 

This core library leverages the **Journey Protocol**: a systemic approach to managing UI states horizontally. Blades unfold across a vast panorama, maintaining their underlying operational state. You can read the foundational philosophy in our **[Expert Thinking Diary](./docs/000-index.md)**.

## Key Features

- **Agnostic State Orchestration:** Powered internally by a lightweight Zustand store, completely divorced from React or Angular rendering loops.
- **The Protocol of Transient vs. Durable State:** Granular control over whether a blade is a permanent routing destination (Durable) or a fleeting contextual action (Transient).
- **Inversion of Mount Points:** Emits layout hooks allowing any modern UI framework to inject heavily optimized micro-frontends directly into the Journey shell.
- **Strict In-Memory Serialization:** Predictable JSON-configurable UI rendering that drastically reduces frontend bundle sizes while enabling real-time Server-Driven UI updates.

## Documentation and Architecture

We treat our documentation as an evolving engineering manifesto. If you intend to contribute or utilize this architecture in your own stacks, please review the internal architectural diaries:

*   [**001: The Journey Protocol**](./docs/001-the-journey-protocol.md)
*   [**002: Inversion of Mount Points**](./docs/002-inversion-of-mount-points.md)

## Installation

```bash
npm install @slashand/sdui-blade-core
```
*(Note: You will typically consume this via a framework-specific wrapper like `@slashand/sdui-blade-react` or `@slashand/sdui-blade-angular`)*

## Contributing

We welcome open-source contributions. When pushing PRs or debating architecture, please refer to the `AGENTS.md` and the existing manifestos in the `docs/` folder to ensure alignment with the horizontal spatiality paradigm.
