/**
 * SYSTEM: @slashand/sdui-blade-core
 * FILE: src/engine/errors.ts
 *
 * CORE RESPONSIBILITIES:
 * 1. Define a strictly-typed deterministic error map for the parser.
 * 2. Prevent generic "MS Desktop" style unhelpful crash messages.
 * 3. Provide exact node telemetry (ID, Type, Path) so consumers can pinpoint JSON faults instantly.
 */

export enum SduiErrorCode {
  ERR_MANIFEST_MISSING_VERSION = 'ERR_MANIFEST_MISSING_VERSION',
  ERR_MANIFEST_MISSING_ROOT_BLADE = 'ERR_MANIFEST_MISSING_ROOT_BLADE',
  ERR_MANIFEST_METADATA_INVALID = 'ERR_MANIFEST_METADATA_INVALID',
  ERR_MANIFEST_ROOT_NOT_BLADE = 'ERR_MANIFEST_ROOT_NOT_BLADE',

  ERR_NODE_DEPTH_EXCEEDED = 'ERR_NODE_DEPTH_EXCEEDED',
  ERR_NODE_MISSING_TYPE = 'ERR_NODE_MISSING_TYPE',
  ERR_NODE_MISSING_REQUIRED_PROP = 'ERR_NODE_MISSING_REQUIRED_PROP',
  ERR_NODE_INVALID_PROPERTY_TYPE = 'ERR_NODE_INVALID_PROPERTY_TYPE',
  ERR_NODE_INVALID_CHILDREN = 'ERR_NODE_INVALID_CHILDREN',

  ERR_EXTENSION_INVALID_MOUNT = 'ERR_EXTENSION_INVALID_MOUNT',
  ERR_UNKNOWN_CRASH = 'ERR_UNKNOWN_CRASH',
}

export interface SduiErrorTelemetry {
  code: SduiErrorCode;
  message: string;
  nodeId?: string;
  nodeType?: string;
  jsonPath?: string; // e.g., "blade.children[0].properties"
}

export class SduiParserError extends Error {
  public readonly code: SduiErrorCode;
  public readonly nodeId?: string;
  public readonly nodeType?: string;
  public readonly jsonPath?: string;

  constructor(telemetry: SduiErrorTelemetry) {
    const docUrl = `https://docs.slashand.com/sdui/errors#${telemetry.code}`;
    const baseMsg = `[${telemetry.code}] ${telemetry.message} ${telemetry.nodeId ? `(Node: ${telemetry.nodeId})` : ''}`;

    // Construct a highly readable developer-friendly console message with a contextual documentation link
    super(`${baseMsg}\n   👉 Read more about this schema rule: ${docUrl}\n`);

    this.name = 'SduiParserError';
    this.code = telemetry.code;
    this.nodeId = telemetry.nodeId;
    this.nodeType = telemetry.nodeType;
    this.jsonPath = telemetry.jsonPath;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, SduiParserError);
    }
  }

  /**
   * Serializes the error so it can be safely sent to Datadog, Sentry, or logged in Redux tools.
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      nodeId: this.nodeId,
      nodeType: this.nodeType,
      jsonPath: this.jsonPath,
      docUrl: `https://docs.slashand.com/sdui/errors#${this.code}`,
      stack: this.stack,
    };
  }
}
