const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targets = [
  '.next',
  '.next-build',
  'coverage',
  'test-results',
  'tmp',
  'tsconfig.tsbuildinfo',
];

for (const target of targets) {
  const absoluteTarget = path.join(rootDir, target);

  if (!absoluteTarget.startsWith(rootDir)) {
    throw new Error(`Refusing to remove path outside workspace: ${absoluteTarget}`);
  }

  if (!fs.existsSync(absoluteTarget)) {
    continue;
  }

  fs.rmSync(absoluteTarget, { recursive: true, force: true });
}
