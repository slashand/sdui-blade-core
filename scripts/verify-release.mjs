import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lockfile = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;

assert.match(manifest.version, /^\d+\.\d+\.\d+$/, 'Stable release version required');
assert.equal(lockfile.version, manifest.version, 'Lockfile version must match the package');
assert.equal(lockfile.packages[''].version, manifest.version, 'Lockfile root version must match the package');

if (tag === '--local') {
  const packageUrl = `https://registry.npmjs.org/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`;
  const response = await fetch(packageUrl, {
    headers: { 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 200) {
    throw new Error(`${manifest.name}@${manifest.version} is already published; choose a new version.`);
  }
  if (response.status !== 404) {
    throw new Error(`Could not verify npm version availability (HTTP ${response.status}).`);
  }
  console.info(`Verified Core ${manifest.version} is unpublished and ready for direct npm publication.`);
} else {
  assert.equal(tag, `v${manifest.version}`, 'GitHub release tag must match the package version');
  console.info(`Verified Core release identity ${tag}.`);
}
