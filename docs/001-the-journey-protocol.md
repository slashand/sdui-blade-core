# The Journey Protocol: A Manifesto on Horizontal State Spatiality

> [!IMPORTANT]
> This is a living document. It acts as an "Expert Thinking Diary" for the engineering decisions underlying the SDUI Blade System. It is designed to be challenged, improved, and evolved by the open-source community.

## The Death of the Modal Window

For decades, enterprise software has relied on a fundamentally flawed interaction paradigm: the **Modal Window**. When a user needs to perform a secondary action (e.g., "Edit Tags" or "Create Resource"), the application darkens the screen, locks the primary context, and forces the user into a contextual prison.

Modals are an admission of architectural defeat. They break the user's flow, destroy contextual awareness, and create a fragile z-index warfare in the DOM.

The **Journey Protocol** is the antidote.

## The Glass Brain: Horizontal Unfolding

Imagine the user interface not as a stack of pages, but as a vast, continuous horizontal panorama—a "Glass Brain" where every thought, action, and context remains visible.

When a user initiates an action, we do not cover their current context. Instead, a new **Blade** slides into existence to the right.

### The Journey Container

The application shell is divided into the **Global Perimeter** (Top Navigation, Left Sidebar) and the **Journey Layout**.

The Journey Layout is the horizontal theater. It uses standard CSS Flexbox/Grid protocols to manage an array of active Blades. Crucially, **the Journey is non-blocking**. Every Blade underneath the active Blade remains fully functional and un-dimmed.

## Transient vs. Durable State

The orchestration engine respects two fundamental kinds of existence:

### 1. Durable Blades (The Constellation Map)
Durable Blades are the backbone of the user's workflow. They represent permanent locations and resources (e.g., viewing a specific user profile or an infrastructure dashboard).
*   **Routing:** Durable Blades are deeply integrated into the URL context (often via hashes or complex URL parameters).
*   **Rehydration:** If the user refreshes the browser, the Engine can read the URL and reconstruct the exact sequence of Durable Blades.

### 2. Transient Blades (The Ephemeral Phantoms)
Transient Blades exist solely in the ephemeral memory of the browser. They are used for immediate, localized actions (e.g., "Give Feedback" or "Quick Edit").
*   **No Routing:** Transient Blades are *never* committed to the URL.
*   **Volatility:** If a user refreshes the browser while a Transient Blade is open, the blade vanishes. The Engine simply rehydrates the last known Durable state, ensuring the user is returned to a safe, persistent reality.
*   **Resolution:** When a Transient Blade completes its mission or is dismissed, it elegantly slides away, revealing the underlying Durable reality without a single destructive reload.

## Inversion of Control: The Agnostic Core

The `@slashand/sdui-blade-core` acts as a pure, mathematical orchestrator. It knows **nothing** about React components or Angular templates.

It maintains a `JourneyStore`—an absolute source of truth regarding which Blades are open, their sequential order, their maximized status, and their transient reality. It communicates with the UI layer entirely via JSON payloads.

*This separation ensures the UI can be endlessly refactored while the Journey Protocol remains immutable.*
