import assert from 'node:assert/strict';
import { existsSync, lstatSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(repository, 'dist');
assert.equal(dirname(output), repository, 'Build output must stay inside this repository');
if (existsSync(output)) {
  assert.equal(lstatSync(output).isSymbolicLink(), false, 'Refusing to remove a linked build directory');
  rmSync(output, { recursive: true, force: true });
}
