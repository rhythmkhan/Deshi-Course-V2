const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const env = {
  ...process.env,
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-build',
};
const trackedFiles = ['tsconfig.json', 'next-env.d.ts'];
const backups = new Map();

for (const file of trackedFiles) {
  const absoluteFile = path.join(rootDir, file);
  backups.set(
    absoluteFile,
    fs.existsSync(absoluteFile) ? fs.readFileSync(absoluteFile, 'utf8') : null,
  );
}

let child = null;
let heartbeat = null;
let cleanedUp = false;

function restoreTrackedFiles() {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;

  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }

  for (const [absoluteFile, originalContent] of backups.entries()) {
    if (originalContent === null) {
      continue;
    }

    fs.writeFileSync(absoluteFile, originalContent, 'utf8');
  }
}

function stopChildTree(exitCode = 130) {
  if (!child || child.exitCode !== null) {
    restoreTrackedFiles();
    process.exit(exitCode);
  }

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });

    killer.once('close', () => {
      restoreTrackedFiles();
      process.exit(exitCode);
    });

    return;
  }

  child.kill('SIGTERM');
  setTimeout(() => {
    if (child && child.exitCode === null) {
      child.kill('SIGKILL');
    }
  }, 3000).unref();
}

process.once('SIGINT', () => stopChildTree(130));
process.once('SIGTERM', () => stopChildTree(143));

async function main() {
  const nextBin = require.resolve('next/dist/bin/next');
  const startedAt = Date.now();

  child = spawn(process.execPath, [nextBin, 'build'], {
    stdio: 'inherit',
    env,
    windowsHide: false,
  });

  heartbeat = setInterval(() => {
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    process.stdout.write(
      `\n[build-isolated] Still building... ${elapsedSeconds}s elapsed. If you stop this command, the child build process will also be terminated.\n`,
    );
  }, 15000);

  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (signal) {
        resolve(1);
        return;
      }

      resolve(typeof code === 'number' ? code : 1);
    });
  });

  restoreTrackedFiles();
  process.exit(exitCode);
}

main().catch((error) => {
  restoreTrackedFiles();
  console.error(error);
  process.exit(1);
});
