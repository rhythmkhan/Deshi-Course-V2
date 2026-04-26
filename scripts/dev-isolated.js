const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const env = {
  ...process.env,
  PORT: process.env.PORT || '3001',
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-dev',
  DISABLE_HMR: process.env.DISABLE_HMR || 'true',
};

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
