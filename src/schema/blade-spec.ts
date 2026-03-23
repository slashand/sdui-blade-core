/**
 * SYSTEM: @slashand/sdui-blade-core
 * FILE: src/schema/blade-spec.ts
 *
 * CORE RESPONSIBILITIES:
 * 1. Define the rigorous, Framework-Agnostic JSON Schema for the Journey Protocol.
 * 2. Act as the ultimate source of truth for React/Angular renderers parsing the active payload.
 *
 * DESIGN PATTERN: DOMAIN-DRIVEN DESIGN INTERFACES
 */

/**
 * SDUI Element Types
 * Represents the fundamental generic UI component nodes as string constants.
 * Explicitly mimicking standard spatial taxonomy structures without proprietary naming.
 */
export enum SduiElementType {
  // Containers
  Blade = 'Sdui.Container.Blade',
  Hub = 'Sdui.Container.Hub',
  Lens = 'Sdui.Container.Lens',

  // Layout
  Section = 'Sdui.Layout.Section',
  Group = 'Sdui.Layout.Group',
  Part = 'Sdui.Layout.Part',
  Pivot = 'Sdui.Layout.Pivot',
  Grid = 'Sdui.Layout.Grid',

  // Input
  TextBox = 'Sdui.Input.TextBox',
  Dropdown = 'Sdui.Input.Dropdown',
  Checkbox = 'Sdui.Input.Checkbox',
  Toggle = 'Sdui.Input.Toggle',

  // Display
  Text = 'Sdui.Display.Text',
  Label = 'Sdui.Display.Label',
  Icon = 'Sdui.Display.Icon',
  Image = 'Sdui.Display.Image',
  StatusBadge = 'Sdui.Display.StatusBadge',
  Alert = 'Sdui.Display.Alert',

  // Data
  DataGrid = 'Sdui.Data.DataGrid',
  List = 'Sdui.Data.List',

  // Actions
  Button = 'Sdui.Action.Button',
  InvokeControl = 'Sdui.Action.InvokeControl',
  CommandBar = 'Sdui.Action.CommandBar',
  Link = 'Sdui.Action.Link',

  // Core Orchestration
  ExtensionMount = 'Sdui.Core.ExtensionMount',
}

/**
 * Base SDUI Node Interface
 * All JSON elements in the layout tree must extend this foundation.
 */
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

/**
 * Action definitions (e.g., clicking a button or opening a new Blade transiently)
 */
export interface SduiAction {
  type: 'navigate' | 'invoke' | 'dispatch';
  target?: string;
  payload?: Record<string, unknown>;
}

export interface SduiInvokeControl extends SduiNode {
  type: SduiElementType.InvokeControl;
  properties: {
    label: string;
    action: SduiAction;
    icon?: string;
    disabled?: boolean;
  };
}

export interface SduiBlade {
  id: string;
  type: SduiElementType.Blade;
  properties: {
    title: string;
    subtitle?: string;
    width?: 'small' | 'medium' | 'large' | 'xlarge' | number;
    region?: string; // Target spatial boundary (e.g., 'global', 'content', 'sidebar')

    // --- ENTERPRISE CORE CAPABILITIES ---
    isDirty?: boolean; // Prevents accidental closure (unsaved changes)
    disableClose?: boolean; // Entirely hides the 'X' button in the blade header
    version?: string | number; // Optimistic concurrency tracking (revision IDs)
    etag?: string; // Payload integrity hash preventing save conflicts

    toolbar?: SduiNode[]; // Action headers (Save, Discard)
    footer?: SduiNode[]; // Fixed bottom Action bars
  };
  children?: SduiNode[];
}

export interface SduiSection extends SduiNode {
  type: SduiElementType.Section;
  properties?: {
    title?: string;
    collapsible?: boolean;
    isCollapsed?: boolean;
  };
  children?: SduiNode[];
}

/** --------------------------------------------------------------------------
 *  LAYOUT COMPONENTS
 *  ----------------------------------------------------------------------- */
export interface SduiPivot extends SduiNode {
  type: SduiElementType.Pivot;
  properties: {
    selectedIndex?: number;
    items: Array<{ title: string; targetId: string }>;
  };
}

export interface SduiGrid extends SduiNode {
  type: SduiElementType.Grid;
  properties: {
    columns: number;
    gap?: string;
  };
}

/** --------------------------------------------------------------------------
 *  INPUT / FORM COMPONENTS
 *  ----------------------------------------------------------------------- */
export interface SduiTextBox extends SduiNode {
  type: SduiElementType.TextBox;
  properties: {
    label?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    multiline?: boolean;
    onChange?: SduiAction;
  };
}

export interface SduiDropdown extends SduiNode {
  type: SduiElementType.Dropdown;
  properties: {
    label?: string;
    options: Array<{ text: string; value: string | number }>;
    selectedValue?: string | number;
    onChange?: SduiAction;
  };
}

export interface SduiToggle extends SduiNode {
  type: SduiElementType.Toggle;
  properties: {
    label?: string;
    checked?: boolean;
    onText?: string;
    offText?: string;
    onChange?: SduiAction;
  };
}

/** --------------------------------------------------------------------------
 *  DISPLAY COMPONENTS
 *  ----------------------------------------------------------------------- */
export interface SduiStatusBadge extends SduiNode {
  type: SduiElementType.StatusBadge;
  properties: {
    status: 'success' | 'warning' | 'error' | 'info' | 'unknown';
    text: string;
  };
}

export interface SduiAlert extends SduiNode {
  type: SduiElementType.Alert;
  properties: {
    type: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    message: string;
  };
}

/** --------------------------------------------------------------------------
 *  DATA / TABLE COMPONENTS
 *  ----------------------------------------------------------------------- */
export interface SduiDataGrid extends SduiNode {
  type: SduiElementType.DataGrid;
  properties: {
    columns: Array<{ key: string; name: string; type?: 'string' | 'number' | 'boolean' }>;
    rows: Array<Record<string, unknown>>;
    selectable?: 'single' | 'multiple' | 'none';
  };
}

/** --------------------------------------------------------------------------
 *  ACTION COMPONENTS
 *  ----------------------------------------------------------------------- */
export interface SduiCommandBar extends SduiNode {
  type: SduiElementType.CommandBar;
  properties: {
    items: Array<{
      key: string;
      text: string;
      icon?: string;
      action: SduiAction;
    }>;
  };
}

/**
 * The Root Journey Manifest perfectly representing a specific JSON layout payload.
 */
export interface SduiManifest {
  version: string;
  metadata?: {
    timestamp?: string;
    origin?: string;
    traceId?: string;
    [key: string]: unknown;
  };
  blade: SduiBlade;
}
