import assert from 'node:assert/strict';
import { SduiParser, SduiElementType, createSduiBladeStore } from '../dist/index.js';

assert.equal(typeof SduiParser.safeParse, 'function');
assert.equal(typeof createSduiBladeStore, 'function');
assert.equal(typeof SduiElementType.Blade, 'string');
assert.equal(SduiParser.safeParse(null).success, false);
console.info('Native Node ESM package entry and public exports verified.');
