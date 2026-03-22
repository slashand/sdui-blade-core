import { SduiManifest, SduiNode, SduiElementType, SduiBlade } from '../schema/blade-spec';
import { SduiParserError, SduiErrorCode } from './errors';

export class SduiParser {
  /**
   * Gracefully parses a payload without blowing up the rendering thread.
   * Emits structural telemetry instead of crashing.
   */
  static safeParse(rawJson: unknown): { success: boolean; data?: SduiManifest; error?: Error } {
    try {
      const data = this.parseManifest(rawJson);
      return { success: true, data };
    } catch (e) {
      if (e instanceof SduiParserError) {
        return { success: false, error: e };
      }
      return {
        success: false,
        error: new SduiParserError({ code: SduiErrorCode.ERR_UNKNOWN_CRASH, message: String(e) }),
      };
    }
  }

  /**
   * Validates and hydrates a raw JSON payload into a strictly typed SduiManifest

   */
  static parseManifest(rawJson: unknown): SduiManifest {
    if (!rawJson || typeof rawJson !== 'object') {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_MANIFEST_MISSING_ROOT_BLADE,
        message: 'Invalid payload. Expected an object.',
        jsonPath: 'root',
      });
    }

    const payload = rawJson as Record<string, any>;

    if (typeof payload.version !== 'string') {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_MANIFEST_MISSING_VERSION,
        message: 'Missing or invalid "version".',
        jsonPath: 'root.version',
      });
    }

    if (!payload.blade || typeof payload.blade !== 'object') {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_MANIFEST_MISSING_ROOT_BLADE,
        message: 'Missing root "blade" declaration.',
        jsonPath: 'root.blade',
      });
    }

    if (payload.metadata && typeof payload.metadata !== 'object') {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_MANIFEST_METADATA_INVALID,
        message: '"metadata" must be an object if provided.',
        jsonPath: 'root.metadata',
      });
    }

    // Recursively validate the blade node
    const hydratedBlade = this.parseNode(payload.blade, 0) as SduiBlade;

    if (hydratedBlade.type !== SduiElementType.Blade) {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_MANIFEST_ROOT_NOT_BLADE,
        message: `Root node must be of type ${SduiElementType.Blade}`,
        jsonPath: 'root.blade.type',
      });
    }

    return {
      version: payload.version,
      blade: hydratedBlade,
    };
  }

  /**
   * Recursively validates and normalizes an SduiNode
   */
  static parseNode(rawNode: any, depth = 0): SduiNode {
    if (depth > 50) {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_NODE_DEPTH_EXCEEDED,
        message: 'Maximum node depth exceeded (50). Potential malicious payload or infinite loop.',
      });
    }

    if (!rawNode.id || typeof rawNode.id !== 'string') {
      // Auto-generate ID if missing to ensure tree tracking
      rawNode.id = `sdui-${Math.random().toString(36).substring(2, 9)}`;
    }

    if (!rawNode.type || typeof rawNode.type !== 'string') {
      throw new SduiParserError({
        code: SduiErrorCode.ERR_NODE_MISSING_TYPE,
        message: 'Node missing required "type" property.',
        nodeId: rawNode.id,
      });
    }

    const type = rawNode.type as SduiElementType;
    const properties = rawNode.properties || {};

    // ----------------------------------------------------------------------
    // RIGOROUS COMPONENT-LEVEL TAXONOMY VALIDATION
    // ----------------------------------------------------------------------
    switch (type) {
      case SduiElementType.Blade:
        if (properties.toolbar && !Array.isArray(properties.toolbar)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_INVALID_PROPERTY_TYPE,
            message: 'Blade strictly requires "toolbar" to be an array of nodes.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        if (properties.footer && !Array.isArray(properties.footer)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_INVALID_PROPERTY_TYPE,
            message: 'Blade strictly requires "footer" to be an array of nodes.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.DataGrid:
        if (!Array.isArray(properties.columns)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'DataGrid strictly requires a "columns" array.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        if (!Array.isArray(properties.rows)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'DataGrid strictly requires a "rows" array.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.Pivot:
        if (!Array.isArray(properties.items)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'Pivot strictly requires an "items" array.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.CommandBar:
        if (!Array.isArray(properties.items)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'CommandBar strictly requires an "items" array.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.Grid:
        if (typeof properties.columns !== 'number') {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'Grid strictly requires a numeric "columns" value.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.Dropdown:
        if (!Array.isArray(properties.options)) {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'Dropdown strictly requires an "options" array.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.StatusBadge:
        if (typeof properties.status !== 'string' || typeof properties.text !== 'string') {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'StatusBadge strictly requires "status" and "text" string properties.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.Alert:
        if (typeof properties.type !== 'string' || typeof properties.message !== 'string') {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'Alert strictly requires "type" and "message" string properties.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.ExtensionMount:
        if (typeof properties.mountPoint !== 'string') {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_EXTENSION_INVALID_MOUNT,
            message: 'ExtensionMount strictly requires a "mountPoint" string property.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;

      case SduiElementType.InvokeControl:
        if (typeof properties.label !== 'string' || typeof properties.action !== 'object') {
          throw new SduiParserError({
            code: SduiErrorCode.ERR_NODE_MISSING_REQUIRED_PROP,
            message: 'InvokeControl strictly requires "label" string and "action" object properties.',
            nodeId: rawNode.id,
            nodeType: type,
          });
        }
        break;
    }

    const node: SduiNode = {
      id: rawNode.id,
      type: type,
      properties: properties,
    };

    if (type === SduiElementType.Blade) {
      if (Array.isArray(rawNode.properties?.toolbar)) {
        node.properties!.toolbar = rawNode.properties.toolbar.map((child: any) => this.parseNode(child, depth + 1));
      }
      if (Array.isArray(rawNode.properties?.footer)) {
        node.properties!.footer = rawNode.properties.footer.map((child: any) => this.parseNode(child, depth + 1));
      }
    }

    if (Array.isArray(rawNode.children)) {
      node.children = rawNode.children.map((child: any) => this.parseNode(child, depth + 1));
    }

    return node;
  }
}
