import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

  if (packageJson.version === version) {
    continue;
  }

  packageJson.version = version;
  fs.writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
}
