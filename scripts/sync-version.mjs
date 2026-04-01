import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Read the shared application version and copy it into each package.json that needs it.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const versionFilePath = path.join(repoRoot, 'app-version.json');
const packageFiles = [
  path.join(repoRoot, 'SimpleNotesAPI', 'package.json'),
  path.join(repoRoot, 'SimpleNotesUI', 'package.json'),
];

const { version } = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

for (const packageFile of packageFiles) {
  if (!fs.existsSync(packageFile)) {
    continue;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

  // Skip writes when the version is already aligned to keep the script idempotent.
  if (packageJson.version === version) {
    continue;
  }

  packageJson.version = version;
  fs.writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
}
