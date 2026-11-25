const fs = require('fs');
const cp = require('child_process');

try {
  fs.mkdirSync('.next/standalone/.next', { recursive: true });
  fs.mkdirSync('.next/server/pages', { recursive: true });
} catch (e) {}

const res = cp.spawnSync('next', ['build'], { stdio: 'inherit', shell: true });
process.exit(res.status || 0);
