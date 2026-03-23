# The Inversion of Mount Points: A Lesson in Empty Space

> [!TIP]
> Architecture is not just about what you build; it is about the space you leave empty for others to fill.

To build a truly decoupled, scalable Enterprise UX, the orchestrator and the renderer must remain blind to each other's implementation details. The `@slashand/sdui-blade-core` orchestrates the *Journey*, but it does not paint the pixels.

## The Empty Slot Directive

If you inspect the raw HTML of a fully formed Journey, you will see a fascinating pattern. The DOM is littered with elements that serve no immediate visual purpose:

*   `sdui-blade-header-react-mount-point`
*   `sdui-tile-actionbar-contextmenu`
*   `sdui-commandbar-target`

These are not mistakes. They are **Mount Points**—calculated, provisioned void spaces.

### The Component Registry

1.  **Registration:** An independent micro-frontend (an "Extension") registers its React or Angular components with the core engine's registry dictionary via a unique string identifier (e.g., `Slashand.Common.TagsUi`).
2.  **Orchestration Initiation:** A JSON payload arrives, instructing the system to open a specific Blade configuration. The Engine computes the required DOM topology.
3.  **The Broadcast:** The Engine does not instantiate the component. It simply emits an event: *"I have provisioned a Blade. In the slot tagged `sdui-blade-content-mount-point`, inject the component registered as `Slashand.Common.TagsUi` with the following JSON configuration..."*
4.  **The Fulfillment:** The framework-specific wrapper (`sdui-blade-react` or `sdui-blade-angular`) listens to the broadcast, resolves the string identifier from the registry, and mounts the actual UI into the empty slot.

## The Power of the Void

By utilizing provisioned Mount Points, we completely eliminate hardcoded dependencies. A Blade can request a `Lens` (a form panel) or a `CommandBar` extension that may or may not exist at runtime.

If the extension is not loaded, the Mount Point remains empty, but the structural integrity of the Blade—the CSS Grid that bounds it—remains perfectly intact.
