import { mkdirSync, cpSync } from 'node:fs';

const src = new URL('../src', import.meta.url);
const dist = new URL('../dist', import.meta.url);

mkdirSync(dist, { recursive: true });

const copy = (name, copyParams) => {
  cpSync(new URL(`../src/${name}`, import.meta.url), new URL(`../dist/${name}`, import.meta.url), copyParams);
};

copy('manifest.json');
copy('popup.html');
copy('offscreen.html');
copy('settings.html');
copy('assets',{ recursive: true });