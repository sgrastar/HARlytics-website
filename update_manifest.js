import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const manifestPath = path.join(process.cwd(), 'build', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const appDir = path.join(process.cwd(), 'build', 'app', 'immutable');

// Update background script
//const backgroundScript = fs.readdirSync(path.join(appDir, 'entry')).find(file => file.startsWith('start.'));
//manifest.background.service_worker = `app/immutable/entry/${backgroundScript}`;
//fs.renameSync(path.join(process.cwd(), 'build', manifest.background.service_worker), path.join(process.cwd(), 'build', 'service-worker.js'));
//manifest.background.service_worker = 'service-worker.js';

// Update content script
const contentScript = fs.readdirSync(path.join(appDir, 'entry')).find(file => file.startsWith('app.'));
manifest.content_scripts[0].js = [`app/immutable/entry/${contentScript}`];

// Update web accessible resources
const chunks = fs.readdirSync(path.join(appDir, 'chunks'));
const assets = fs.readdirSync(path.join(appDir, 'assets'));
const nodes = fs.readdirSync(path.join(appDir, 'nodes'));

manifest.web_accessible_resources[0].resources = [
  ...chunks.map(file => `app/immutable/chunks/${file}`),
  ...assets.map(file => `app/immutable/assets/${file}`),
  ...nodes.map(file => `app/immutable/nodes/${file}`)
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
