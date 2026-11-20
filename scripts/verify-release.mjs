import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lockfile = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;

assert.match(manifest.version, /^\d+\.\d+\.\d+$/, 'Stable release version required');
assert.equal(tag, `v${manifest.version}`, 'GitHub release tag must match the package version');
assert.equal(lockfile.version, manifest.version, 'Lockfile version must match the package');
assert.equal(lockfile.packages[''].version, manifest.version, 'Lockfile root version must match the package');
console.info(`Verified Core release identity ${tag}.`);
