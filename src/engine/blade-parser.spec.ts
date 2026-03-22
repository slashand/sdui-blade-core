import { describe, it, expect } from 'vitest';
import { SduiParser } from './blade-parser';
import { SduiElementType, SduiManifest } from '../schema/blade-spec';

describe('SduiParser Engine Validation', () => {
  describe('Root Manifest Integrity', () => {
    it('Parses a valid minimal Enterprise Manifest safely', () => {
      const rawPayload = {
        version: '1.0',
        blade: {
          id: 'test-blade-01',
          type: 'Sdui.Container.Blade',
          properties: { title: 'Test Hub', toolbar: [{ type: 'Sdui.Action.CommandBar', properties: { items: [] } }] },
        },
      };

      const manifest = SduiParser.parseManifest(rawPayload);
      expect(manifest.version).toBe('1.0');
      expect(manifest.blade.type).toBe(SduiElementType.Blade);
      expect(manifest.blade.properties?.toolbar).toBeDefined();
      expect(manifest.blade.properties?.toolbar![0].type).toBe(SduiElementType.CommandBar);
    });

    it('Throws if root payload is entirely missing "blade"', () => {
      expect(() => SduiParser.parseManifest({ version: '1.0' })).toThrowError(/Missing root "blade" declaration/);
    });

    it('Throws if root blade is not fundamentally a Blade type', () => {
      expect(() => SduiParser.parseManifest({ version: '1.0', blade: { type: 'Sdui.Display.Text' } })).toThrowError(
        /Root node must be of type/,
      );
    });
  });

  describe('Deep Node Validation & Hydration', () => {
    it('Auto-generates strict DOM UUIDs for nodes missing an "id"', () => {
      const node = SduiParser.parseNode({ type: SduiElementType.Text, properties: { value: 'Test' } });
      expect(node.id).toBeDefined();
      expect(node.id).toMatch(/^sdui-/);
    });

    it('Throws a fatal schema error if a Node lacks a "type" property completely', () => {
      expect(() => SduiParser.parseNode({ id: '1' })).toThrowError(/missing required "type"/);
    });
  });

  describe('Strict Component Taxonomy Edge-Cases', () => {
    // DataGrid
    it('Rejects a DataGrid missing the "columns" array', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.DataGrid, properties: { rows: [] } })).toThrowError(
        /DataGrid strictly requires a "columns" array/,
      );
    });
    it('Rejects a DataGrid missing the "rows" array', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.DataGrid, properties: { columns: [] } })).toThrowError(
        /DataGrid strictly requires a "rows" array/,
      );
    });
    it('Approves a flawless DataGrid', () => {
      expect(
        SduiParser.parseNode({ type: SduiElementType.DataGrid, properties: { columns: [], rows: [] } }),
      ).toBeDefined();
    });

    // Pivot
    it('Rejects a Pivot tab missing the "items" definition', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.Pivot, properties: {} })).toThrowError(
        /Pivot strictly requires an "items" array/,
      );
    });
    it('Approves a flawless Pivot', () => {
      expect(
        SduiParser.parseNode({ type: SduiElementType.Pivot, properties: { items: [{ title: 'A', targetId: '1' }] } }),
      ).toBeDefined();
    });

    // CommandBar
    it('Rejects a CommandBar missing items', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.CommandBar, properties: {} })).toThrowError(
        /CommandBar strictly requires an "items" array/,
      );
    });

    // Grid Layout
    it('Rejects a Grid missing numeric column limits', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.Grid, properties: { gap: '10px' } })).toThrowError(
        /Grid strictly requires a numeric "columns"/,
      );
    });

    // Dropdown
    it('Rejects a Dropdown missing internal options', () => {
      expect(() =>
        SduiParser.parseNode({ type: SduiElementType.Dropdown, properties: { label: 'Sort' } }),
      ).toThrowError(/Dropdown strictly requires an "options" array/);
    });

    // StatusBadge
    it('Rejects a StatusBadge missing status constants', () => {
      expect(() =>
        SduiParser.parseNode({ type: SduiElementType.StatusBadge, properties: { text: 'Online' } }),
      ).toThrowError(/StatusBadge strictly requires "status" and "text"/);
    });

    // Alert
    it('Rejects an Alert lacking severity typing', () => {
      expect(() =>
        SduiParser.parseNode({ type: SduiElementType.Alert, properties: { message: 'Failed' } }),
      ).toThrowError(/Alert strictly requires "type" and "message"/);
    });

    // ExtensionMount
    it('Rejects an ExtensionMount without an expected routing point', () => {
      expect(() => SduiParser.parseNode({ type: SduiElementType.ExtensionMount, properties: {} })).toThrowError(
        /ExtensionMount strictly requires a "mountPoint"/,
      );
    });

    // InvokeControl
    it('Rejects an InvokeControl lacking action payloads', () => {
      expect(() =>
        SduiParser.parseNode({ type: SduiElementType.InvokeControl, properties: { label: 'Save' } }),
      ).toThrowError(/InvokeControl strictly requires "label".*and "action"/);
    });
  });

  describe('Enterprise Boundaries & Failsafes', () => {
    it('Gracefully handles maximum call stack DDOS vectors (depth > 50)', () => {
      let deepNode: any = { type: 'Sdui.Container.Lens' };
      let current = deepNode;
      // create 60 levels
      for (let i = 0; i < 60; i++) {
        current.children = [{ type: 'Sdui.Container.Lens' }];
        current = current.children[0];
      }

      const payload = {
        version: '1.0',
        blade: {
          type: 'Sdui.Container.Blade',
          properties: { title: 'Deep Blade' },
          children: [deepNode],
        },
      };

      const result = SduiParser.safeParse(payload);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Maximum node depth exceeded (50)');
    });

    it('Uses safeParse to catch errors without crashing', () => {
      const payload = { version: '1.0', blade: { type: 'Invalid' } };
      const result = SduiParser.safeParse(payload);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('must be of type Sdui.Container.Blade');
    });
  });
});
