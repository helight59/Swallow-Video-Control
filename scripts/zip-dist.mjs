import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(process.cwd());
const distDir = join(projectRoot, 'dist');

if (!existsSync(distDir)) {
  throw new Error(`dist/ not found: ${distDir}. Run build first (npm run build).`);
}

const manifestPath = join(distDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  throw new Error(`dist/manifest.json not found: ${manifestPath}. Check your copy script.`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const safe = (s) => String(s ?? '').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
const name = safe(manifest.name) || 'extension';
const version = safe(manifest.version) || '0.0.0';

const zipName = `${name}-${version}.zip`;
const zipPath = join(projectRoot, zipName);

if (existsSync(zipPath)) {
  rmSync(zipPath, { force: true });
}

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.error) {
    throw r.error;
  }
  if (r.status !== 0) {
    throw new Error(`${cmd} exited with code ${r.status}`);
  }
};

if (process.platform === 'win32') {
  run('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    `Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipPath}" -Force`,
  ]);
} else {
  run('zip', ['-r', '-q', zipPath, '.'], { cwd: distDir });
}

console.log(`ZIP created: ${zipPath}`);