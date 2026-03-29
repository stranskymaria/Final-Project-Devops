import { spawnSync } from 'node:child_process';

const composeArgs = process.argv.slice(2);

if (composeArgs.length === 0) {
  console.error('Usage: npm run staging:up');
  process.exit(1);
}

const gitShaResult = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
  encoding: 'utf8',
});

if (gitShaResult.status !== 0) {
  console.error('Unable to determine git SHA for staging build metadata.');
  process.exit(gitShaResult.status ?? 1);
}

const appBuildSha = gitShaResult.stdout.trim();
const appDeployColor = process.env.APP_DEPLOY_COLOR?.trim() ?? '';
const composeResult = spawnSync('docker', ['compose', ...composeArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    APP_BUILD_SHA: appBuildSha,
    APP_DEPLOY_COLOR: appDeployColor,
  },
});

if (composeResult.status !== 0) {
  process.exit(composeResult.status ?? 1);
}

console.log(`Staging build metadata set to APP_BUILD_SHA=${appBuildSha}.`);
