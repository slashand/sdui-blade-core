/**
 * Core SDUI Interface representing a dynamic Blade component.
 */
export interface SduiBladeNode<TProps = Record<string, any>> {
    /** Unique instance ID for the component (automatically generated if omitted) */
    id?: string;
    /** The string identifier mapping to a registered UI Component */
    type: string;
    /** The serialized props to pass to the dynamically rendered component */
    props?: TProps;
}

export interface BladeState {
    activeBlades: Required<SduiBladeNode>[];
    openBlade: (node: SduiBladeNode) => void;
    closeBlade: (id: string) => void;
    closeTopBlade: () => void;
    closeAllBlades: () => void;
}
