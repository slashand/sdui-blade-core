# The Styling Constants: Engineering the Mathematics

> [!CAUTION]
> If you are building the React (`@slashand/sdui-blade-react`) or Angular (`@slashand/sdui-blade-angular`) shells, **do not guess the padding, margins, or shadows**. Standard Tailwind defaults (like `shadow-lg` or `bg-zinc-900`) will make the application look like a generic MVP. To achieve true density and enterprise polish, you must hard-code the following mathematical constants extracted from the reference architecture.

This document serves as the CSS specification for the fundamental blade shapes, elevations, and layout constraints.

## 1. The Global Density Palette (Dark Mode)
The true enterprise dark mode is not pure black or standard grey. 

*   **Primary Background (Blade Canvas):** `rgb(27, 26, 25)`
*   **Secondary Background (Nav/Resizers):** `rgb(37, 36, 35)`
*   **Primary Text:** `rgb(250, 249, 248)`
*   **Secondary Text (Subtitles/Faded):** `rgb(96, 94, 92)` (Derived from border colors)
*   **Brand Highlight (Focus/Active):** `rgb(24, 144, 241)` (Azure Blue)
*   **Base Typography:** `font-size: 13px; font-weight: 400;` 

## 2. Elevation Geometry (The Blade Shadow)
A Blade is defined by its gravitational separation from the panorama beneath it. Do not attempt to use a single shadow. Every `sdui-blade` MUST use the following dual-shadow calculation:

```css
/* Translates roughly to Drop Shadow 1 + Ambient Shadow 2 */
box-shadow: rgba(0, 0, 0, 0.26) 0 6.4px 14.4px 0, 
            rgba(0, 0, 0, 0.22) 0 1.2px 3.6px 0;
```

## 3. The Global Perimeter (Application Shell)
The absolute layout constraints for the outer shell.

*   **Top Bar Height (`sdui-topbar`):** Exactly `40px`.
*   **Top Bar Background:** `rgb(37, 36, 35)`
*   **Cloud Menu Button:** Exactly `48px` wide by `40px` tall.
*   **PWA Draggability:** The top bar content uses `app-region: drag;`. This is a massive architectural detail—it means the portal is designed to act as an installable desktop PWA where the user can physically drag the window using the custom top bar!

## 4. Structural Dimensions (The Blade)
The vertical rhythm must be rigidly enforced to ensure Mount Points do not collapse.

### The Blade Header
*   **`sdui-blade-title` Block Height:** Exactly `48px`.
*   **`sdui-blade-title` Typography:** `font-size: 14px; line-height: 20px; font-weight: 400;`
*   **`sdui-blade-actions` Block Height:** Exactly `32px`.
*   **Action Bar Alignment:** `justify-content: flex-end;`

### Content Gutters
Internal content does not naturally touch the edges of the Blade wrapper. 

*   **`sdui-commandbar-target` (and primary internal layouts):** `margin: 0px 20px;` 
*(This establishes a strict 20px horizontal inner wall holding the content. Parts and Lenses will also inherit this `20px` gutter alignment).*

## 5. Layout Math & Stacking

*   **`sdui-stacklayout-child`:**
    *   `display: flex;`
    *   `flex-direction: column;`
    *   `max-width: 100%;`

By mapping all CSS utility classes inside React/Angular strictly back to these tokens, we guarantee 100% aesthetic parity with industry-standard orchestration systems.
