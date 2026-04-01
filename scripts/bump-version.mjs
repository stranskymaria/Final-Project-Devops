import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Resolve project paths once so the script works no matter where it is launched from.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const versionFilePath = path.join(repoRoot, 'app-version.json');
const nextVersion = process.argv[2];

// Guardrails: require a semver-like version argument before mutating repository files.
if (!nextVersion) {
  console.error('Usage: npm run release:version -- <version>');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(nextVersion)) {
  console.error(`Invalid version "${nextVersion}". Use semver like 1.0.1 or 1.1.0-rc.1.`);
  process.exit(1);
}

fs.writeFileSync(versionFilePath, `${JSON.stringify({ version: nextVersion }, null, 2)}\n`);

// Keep backend and frontend package versions aligned with app-version.json.
const syncResult = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'sync-version.mjs')], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (syncResult.status !== 0) {
  process.exit(syncResult.status ?? 1);
}

console.log(`Updated shared app version to ${nextVersion}.`);
