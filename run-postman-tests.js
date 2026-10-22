const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = __dirname;
const collection = path.join(root, 'postman/Tugas2_Kolam_Ikan.postman_collection.json');
const environment = path.join(root, 'postman/Development.postman_environment.json');

for (const file of [collection, environment]) JSON.parse(fs.readFileSync(file, 'utf8'));

const newmanBin = path.join(root, 'node_modules/newman/bin/newman.js');
const result = spawnSync(process.execPath, [newmanBin, 'run', collection, '-e', environment, '--reporters', 'cli'], {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
});

const log = (result.stdout || '') + (result.stderr || '');
fs.writeFileSync(path.join(root, 'postman/latest-newman-results.txt'), log, 'utf8');
process.stdout.write(log);
process.exit(result.status ?? 1);
