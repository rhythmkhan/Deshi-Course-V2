const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const env = {
  ...process.env,
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-build',
};
const trackedFiles = ['tsconfig.json', 'next-env.d.ts'];
const backups = new Map();

for (const file of trackedFiles) {
  const absoluteFile = path.join(rootDir, file);
  backups.set(absoluteFile, fs.existsSync(absoluteFile) ? fs.readFileSync(absoluteFile, 'utf8') : null);
}

let exitCode = 1;

try {
  const nextBin = require.resolve('next/dist/bin/next');
  const result = spawnSync(process.execPath, [nextBin, 'build'], {
    stdio: 'inherit',
    env,
  });

  exitCode = typeof result.status === 'number' ? result.status : 1;
} finally {
  for (const [absoluteFile, originalContent] of backups.entries()) {
    if (originalContent === null) {
      continue;
    }

    fs.writeFileSync(absoluteFile, originalContent, 'utf8');
  }
}

process.exit(exitCode);
