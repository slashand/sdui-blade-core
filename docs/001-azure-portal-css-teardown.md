# 001 - The Azure Portal CSS Payload: A Structural Teardown

> [!IMPORTANT]
> **The Baseline of Truth**: In March 2026, we successfully acquired a raw HTML/CSS DOM payload dump directly from the production `portal.azure.com` environment. This document deconstructs Microsoft's proprietary `.fxs-` (Framework Extensions) and `.azc-` (Azure Controls) taxonomy so we can reverse-engineer their spatial perfection into `@slashand/sdui-blade-core`. 

## 1. The URL Hash Routing Paradigm
Azure relies strictly on the URL hash fragment (`window.location.hash`) as the Absolute Source of Truth for the blade stack. 

Example payload URL:
`https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionRenameBlade/subscriptionId/588f392a-88de-47d4-a632-7f53686c7bfe`

**The Breakdown:**
- `#view`: The routing initiator.
- `/Microsoft_Azure_Billing`: The internal "Package" or "Extension" name.
- `/SubscriptionRenameBlade`: The exact Blade Registry Key.
- `/subscriptionId/588...`: Key-value pairs of props injected directly into the Blade component.

**The Golden Rule:** Every back button push, refresh, or forward action relies on the browser's native URL history. The UI is completely subservient to the URL string.

> [!WARNING]
> **The App-Specific Serialization Limit:** As noted by the architecture review, dumping the *entire* state into the URL like Azure does creates unwieldy, massive string lengths which is not suitable for consumer-facing apps like Gravity English. 
> 
> **Resolution:** Our SDUI orchestrator will decouple the physical URL from the *Blade State*. We will use in-memory stores (like `ngneat/elf` or `Zustand`) for transient blade stacking, and only serialize specifically identified "core paths" into short, human-readable URL queries (e.g., `?blade=edit-tags&id=123`) to ensure shareable links remain clean.

## 2. The Spatial Taxonomy (The `.fxs-bladesize` System)
Azure does not use arbitrary widths or flex-grow chaos. They use a strict, enumerated size system that maps beautifully to Tailwind breakpoints. From the CSS payload:

- **Menu / Context Pane**: `.fxs-menublade` = **265px** wide.
- **Small Blade**: `.fxs-bladesize-small` = **315px** wide. (Typically details or fast forms).
- **Medium Blade**: `.fxs-bladesize-medium` = **585px** wide.
- **Large / Expandable Blade**: `.fxs-bladesize-large` = **855px** wide.
- **X-Large Blade**: `.fxs-bladesize-xlarge` = **1125px** wide.

> [!TIP]
> **The "Hit the Wall" responsive physics:** These explicit pixel values are NOT carved in stone. As identified in the DOM payload, blades do not actively shrink to screen size immediately; they remain at their fixed flex-basis *until there is no room left*. Once they "hit the wall" of the viewport, the layout physics switch, and the blade aggressively scales down to `100%` width. 
> 
> **Implementation:** In Tailwind v4, this manifests not as a static `w-[855px]`, but rather as `w-full max-w-[855px] shrink-1` within a Flex container, ensuring blades push against each other infinitely horizontal until forced to collapse by the viewport constraints.

## 3. The Anatomy of an `.fxs-blade`
Microsoft breaks each blade down into an incredibly strict layout hierarchy, completely eliminating nested scrollbar hell:

1. **`.fxs-blade-content-container`**: Display flex, column root.
2. **`.fxs-blade-header`**: 
   - **Height**: Fixed at exactly `64px`.
   - **Flex**: `flex-shrink: 0` (The header NEVER squishes).
   - **Title Text** (`.fxs-blade-title-titleText`): `font-weight: 600`, `font-size: 24px`, `line-height: 28px`.
   - **Subtitle Text** (`.fxs-blade-title-subtitleText`): `font-weight: 400`, `font-size: 12px`, `line-height: 14px`.
3. **`.fxs-blade-content-wrapper`**: 
   - `height: 100%`, `overflow: auto` (This is the **ONLY** part of the blade that scrolls).
4. **`.fxs-blade-stacklayout`**: 
   - Internal padding is set to `padding: 10px 20px 20px 20px`. (In Tailwind v4, this roughly equals `px-5 pb-5 pt-2.5`, highly close to our strict `p-4` minimalist requirement).

## 4. The "Journey Stash" Behavior (Memory & Focus)
The User observed a phenomenal behavior: Clicking "Tell us about your experience" opened a new Feedback Blade, but **forcefully closed (collapsed) the parent smaller Blade**. However, upon closing the Feedback Blade, the parent **reopened dynamically**. 

**Architectural Implication:**
Blades in the stack are not just "open" or "closed." They possess a 3-state visibility machine:
1. **Active**: Fully rendered and visible.
2. **Stashed (Collapsed)**: The blade exists in memory (and in the URL), but a child blade requested maximum horizontal real estate, forcing the parent to render as a `32px` sliver (`.fxs-blade-collapsed { width: 32px }`) or hide completely.
3. **Destroyed**: Removed from the stack and memory.

This means our `@slashand/sdui-blade-core` orchestrator must introduce an `isStashed` boolean to the `BladeNode` interface. When a massive "X-Large" blade mounts, it triggers a `Zustand` action to map all preceding nodes to `isStashed: true`.

## 5. The Spatial Traffic Controller (The Host Intelligence)
As brilliantly identified, the individual CSS flex constraints aren't acting alone. The *Blade Host* (the parent orchestrator) acts as a Spatial Traffic Controller *before* a new blade is even fully rendered.

**The Orchestration Physics:**
1. **The Pre-Flight Check:** Before calling a new blade into existence, the Host evaluates the requested footprint of the incoming child (e.g., `855px` for a Large blade).
2. **Viewport Evaluation:** It checks this against the current `window.innerWidth` minus the already-consumed footprint. 
3. **The "Relax" Protocol:** If the viewport has enough room, the new blade slides in, and the existing blades remain completely active. But if the requested blade *does not fit*, the Host explicitly commands the older blades in the stack to "relax themselves" (triggering the `.fxs-blade-collapsed` Journey Stash state), physically squishing them to `32px` slivers to guarantee room for the new child. If the entire viewport is smaller than the requested blade's default size, the incoming blade is instantly snapped to the "Hit The Wall" `100%` max-width constraint.

This absolute spatial intelligence confirms our SDUI framework needs a dynamic viewport listener directly inside `<BladeHost />`, continuously calculating horizontal real-estate to manage child states.

## 6. The Header Complexity (Commands, Menus & Context)
The `.fxs-blade-header` is not just a simple title string. The Azure portal injects absolute heavy-lifting into this 64px bar. It acts as the primary command center for the entire blade ecosystem.

From the DOM payload, the structural breakdown of the header includes:
1. **`.fxs-blade-title`**: A flex-container wrapping the icon, the massive `.fxs-blade-title-titleText`, and `.fxs-blade-title-subtitleText`.
2. **`.fxs-blade-commands` / `.fxs-blade-commandBar`**: A dedicated shelf extending directly beneath or next to the title (depending on breakpoints) that houses primary workflow actions (e.g., *Save, Discard, Refresh, Manage*).
3. **`.fxs-blade-contextMenu`**: An overflow menu (dots) for secondary commands.
4. **`.fxs-blade-close`**: The universal teardown button.

**Implementation Mandate:** Our SDUI `<BladeHeader />` primitive must stop treating the header as a dumb component. It must accept explicitly defined `<ng-content select="[commands]">` (Angular) or a `commands: ReactNode` prop so that the NLE or Gravity English workspaces can inject massive command bars, dropdowns, and context buttons safely within the rigid `h-[64px]` taxonomy. Furthermore, we must attach descriptive, testable class names (e.g., `sdui-blade-header`, `sdui-blade-commands`) mirroring the `.fxs-` strategy for guaranteed E2E testability.

## 7. The Sub-Component Arsenal (Hardening the Wrappers)
If we only provide developers with `<BladeHeader>` and `<BladeContent>`, they will immediately invent their own non-standard abstractions for standard NLE features. From analyzing Azure's broader DOM, we must natively supply the following strict primitives within our React and Angular wrappers:

1. **The Loading Shim (`.fxs-part-loading`)**: A translucent overlay with a subtle spinner that absolutely positions itself over the `.fxs-blade-content-wrapper` to signal I/O without unmounting the blade's spatial presence.
2. **Context Banners (`.azc-messageBox` / `.fxs-blade-info-banner`)**: Error, Warning, or Success alerts that stack cleanly between the Header and the primary Content, spanning `100%` width.
3. **Inner Navigation Tabs (`.fxs-pivot`)**: The standard Azure "Overview / Properties / Identity" horizontal navigational links that dock directly under the command bar.
4. **Data Properties Grid (`.fxs-summary`)**: Two-column key-value structural grids (`Label` / `Value`) heavily used in Azure for fast ingestion of metadata.

## The Action Plan for `@slashand/sdui-blade-core`
The Azure payload has provided the ultimate spec sheet for our primitive components. We will:
1. Hardcode the exact `265 | 315 | 585 | 855 | 1125` pixel breakpoints into the React/Angular `BaseBlade` wrapper constraints.
2. Ensure the `<BladeHeader>` is strictly `h-16 shrink-0` with `24px` titles.
3. Implement `URL hash routing` as the supreme brain behind the Zustand store.
4. Add `isStashed` functionality for responsive blade collapsing.
