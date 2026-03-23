# The Taxonomic Hierarchy: Anatomy of a Journey

> [!CAUTION]
> It is not enough to understand the philosophy; you must understand the exact physics of the DOM. For developers building the React or Angular rendering shells (`@slashand/sdui-blade-react` / `sdui-blade-angular`), this document is your absolute structural blueprint. It translates the Azure Portal's historical class-based architecture (`fxs-`, `msportalfx-`, `azc-`) into our generic, open-source `sdui-` equivalents.

To reconstruct a world-class horizontal orchestration engine, every single DOM node must have a purpose. The following is an exhaustive mapping of every structural element you must implement.

## Layer 1: The Global Perimeter

The Journey exists within a viewport, but it does not control the entire viewport. The Global Perimeter manages the persistent navigation anchors.

*   `sdui-portal-region` (formerly `fxs-portal-region`): The absolute root container of the application shell.
*   `sdui-portal-main-region` (formerly `fxs-portal-main-region`): The dedicated container for main content, excluding external headers.
*   `sdui-sidebar` (formerly `fxs-sidebar`): The persistent vertical left-hand navigation. Can receive states like `sdui-sidebar-is-collapsed`.
*   `sdui-panorama` (formerly `fxs-panorama fxs-portal-content`): The expansive background container that holds the journey itself. 
*   `sdui-home-target` (formerly `fxs-home-target`): The default mount point when no specific journey is loaded.

## Layer 2: The Journey Layout (The Track)

This is the horizontal Flexbox/Grid track where Blades are laid out sequentially from left to right.

*   `sdui-journey-layout` (formerly `fxs-journey-layout`): The primary organizational shell.
*   `sdui-stacklayout` / `sdui-stacklayout-horizontal` (formerly `fxs-stacklayout fxs-stacklayout-horizontal`): The physical horizontal flex container triggering `overflow-x: auto` when blades exceed viewport width.
*   `sdui-vivaresize` (formerly `fxs-vivaresize`): The invisible, draggable vertical border extending between Blades, allowing the user to resize individual blade widths mathematically. In an ideal world, dragging this triggers a global state update for that Blade's configuration.

## Layer 3: The Blade Skeleton (The Child)

A Blade is simply a specialized child of the stack layout, possessing its own micro-physics.

*   `sdui-stacklayout-child` (formerly `fxs-stacklayout-child`): The physical wrapper injected into the layout.
*   `sdui-blade` (formerly `fxs-blade`): The core structural entity inside the wrapper.
*   `sdui-shadow-level3` (formerly `msportalfx-shadow-level3`): Standardized z-index elevation and drop shadows, crucial for ensuring visual separation between overlapping or adjacent blades.
*   `sdui-menu-blade` (formerly `fxs-blade-known-menu` / `fxs-menublade`): A specialized, often narrower blade dedicated exclusively to navigation (e.g., a list of resources), separating it functionally from broader "content/editing" blades.

### 3a. Blade Lifecycle Classes (The State Machine)
The core engine injects these classes into the React/Angular shell to trigger CSS transitions and layout locks.

*   `sdui-blade-firstblade` / `sdui-blade-lastblade`: Positional awareness (useful for applying rounding to the first or last visible element).
*   `sdui-blade-maximized` / `sdui-blade-collapsed`: Width overrides. A maximized blade expands to fill the remaining horizontal viewport (but NEVER covers the `sdui-sidebar`).
*   `sdui-blade-pending` (formerly `fxs-blade-shows-pending`): Triggers the absolute-positioned skeleton loaders and disables pointer events while JSON data resolves.
*   `sdui-blade-unlocked` (formerly `fxs-bladecontent-unlocked`): The state signifying the JSON payload has fully resolved and rendered.

## Layer 4: Intrinsic Blade Anatomy (The Content)

Once inside a Blade, the `sdui-blade-react` or `sdui-blade-angular` libraries must provision the following specific slots for Inversion of Control.

### The Header Layer
*   `sdui-blade-title` / `sdui-blade-title-subtitle`: The locked typography constraints.
*   `sdui-blade-actions` (formerly `fxs-blade-actions`): The standard right-aligned icon strip inside the header (providing Pin, Maximize, Close actions).
*   `sdui-commandbar-target` (formerly `fxs-commandBar-target`): The dedicated Mount Point immediately below the title, reserved for horizontal button arrays (Save, Discard, Execute).
*   `sdui-blade-header-react-mount-point` (formerly `fxs-blade-header-react-mount-point`): The ultimate provisioned empty slot where the JSON orchestrator tells the registry to inject custom header components.

### The Content Layer (Parts and Lenses)
*   **Parts** (formerly `fxs-part-collectionpart`): Structural boundaries for sections of a blade. If a blade is "Edit User," a Part might be "Security Settings."
*   **Properties** (formerly `msportalfx-property`): Strict key-value grid pairs. A massive percentage of enterprise UI is just labels and values. This standardizes the CSS Grid for them.
*   **Pickers** (formerly `msportalfx-specpicker`): Specialized complex widgets. If you build a pricing tier selector, it conforms to the spec picker layout constraints.

## Layer 5: Overlays & Teleportation

Sometimes a Blade needs to break its own horizontal constraints momentarily (without opening a full Transient Blade).

*   `sdui-balloon` / `sdui-dockedballoon-info` (formerly `azc-balloon`, `azc-dockedballoon-info`): Popovers, dropdowns, and context menus. These must utilize React Portals or Angular's Overlay Module to ensure they escape the `overflow: hidden` bounding boxes of the Blade content area.
*   `sdui-info-box` (formerly `fxc-infoBox`): High-contrast alerts embedded at the top of the Blade content area (e.g., "This resource is being deleted").
*   `sdui-blade-status-text-container`: Small status indicators, often nestled near the close button or command bar.

---

> By mapping these structural requirements, any open-source contributor can look at the React or Angular rendering libraries and understand *exactly* what CSS Grid or HTML scaffolding they are expected to build, maintaining total architectural parity with the core mathematical engine.
