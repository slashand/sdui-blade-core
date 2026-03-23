# 005: Schema and Types

The true power of `@slashand/sdui-blade-core` lies in its rigorous, framework-agnostic JSON schema. This schema acts as the ultimate source of truth for any React, Angular, or Vue renderer parsing an SDUI payload.

## The Foundation: `SduiNode`

Every element within the Blade Protocol layout tree must implement the base `SduiNode` interface.

```typescript
export interface SduiNode {
  /** The unique identifier for this instance in the DOM/Tree */
  id: string;
  /** The type of component the renderer should mount */
  type: SduiElementType | string;
  /** Custom generic properties passed to the component */
  properties?: Record<string, unknown>;
  /** Optional nested children */
  children?: SduiNode[];
}
```

## The SDUI Taxonomy (`SduiElementType`)

The core engine maps structural components to explicit generic constants. When your backend emits a layout JSON manifest, it relies on this taxonomy so the frontend renderers know exactly what empty layouts to instantiate.

- **Containers:** `Blade`, `Hub`, `Lens`
- **Layout:** `Section`, `Group`, `Part`, `Pivot`, `Grid`
- **Input:** `TextBox`, `Dropdown`, `Checkbox`, `Toggle`
- **Display:** `Text`, `Label`, `Icon`, `Image`, `StatusBadge`, `Alert`
- **Data:** `DataGrid`, `List`
- **Actions:** `Button`, `InvokeControl`, `CommandBar`, `Link`

## The Master `SduiBlade` Entity

The overarching structural wrapper of the Journey is the `Blade`. 

```typescript
export interface SduiBlade {
  id: string;
  type: SduiElementType.Blade;
  properties: {
    title: string;
    subtitle?: string;
    width?: 'small' | 'medium' | 'large' | 'xlarge' | number;
    region?: string; // Target spatial boundary
    
    // Enterprise safeguards
    isDirty?: boolean; 
    disableClose?: boolean; 
    version?: string | number; 
    etag?: string; 
  };
  children?: SduiNode[];
}
```

By retaining this single source of truth in `@slashand/sdui-blade-core`, we guarantee that if the Backend Team adds a new container mechanism or form primitive, all frontend wrappers instantly receive strong compilation typing, and breaking changes alert the host application instantly.
