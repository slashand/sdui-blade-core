# 006: Spatial Boundaries and Regions

A massive enterprise application does not possess a single layout root. A user might navigate the main workspace (a `global` boundary), or they might open a settings panel confined specifically to a 350px interactive widget (a `sidebar` boundary).

## The `region` Property

To accommodate complex mounting contexts, the core Blade Schema features the `region` layout targeting string on the `SduiBlade` interface.

```typescript
{
  id: "blade-123",
  type: "Sdui.Container.Blade",
  properties: {
    title: "Account Preferences",
    region: "floating-sidebar" // Targets a profoundly specific area of the DOM
  }
}
```

## How Frameworks Consume Regions

Because `@slashand/sdui-blade-core` is purely abstract, it **does not care** how the DOM is structured. It simply broadcasts the entire Array of active active blade nodes via local reactive states (or generic array updates).

It is up to the *framework* (e.g., `@slashand/sdui-blade-angular`'s `SduiBladeHostComponent`) to query the instantiated Host constraints:

```typescript
// Conceptual rendering logic inside an Angular/React Host targeting the 'floating-sidebar'
const bladesForThisRegion = globalStore.blades.filter(
   b => (b.properties?.region || 'global') === this.hostRegionBoundary
);
```

By decoupling the layout metadata (`region`) from the specific DOM tree node traversals, the logic perfectly respects the **Inversion of Mount Points** manifesto. The agnostic backend drives spatial alignment, the agnostic core distributes it, and the native frontend wrapper merely obeys it.
