import { execSync } from 'child_process';
import path from 'path';

const distPath = path.resolve('apps/web/dist');
console.log('Pushing compiled dist directly to GitHub deploy branch...');

try {
  execSync('git init', { cwd: distPath, stdio: 'inherit' });
  execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
  execSync('git commit -m "Auto-deploy release to Hostinger"', { cwd: distPath, stdio: 'inherit' });
  execSync('git branch -M deploy', { cwd: distPath, stdio: 'inherit' });
  try {
    execSync('git remote add origin https://github.com/mhussain-codes/atbrand-backend.git', { cwd: distPath, stdio: 'ignore' });
  } catch (e) {}
  execSync('git push -u origin deploy --force', { cwd: distPath, stdio: 'inherit' });
  console.log('SUCCESS! Compiled website pushed to GitHub deploy branch.');
} catch (err) {
  console.error('Failed to push to deploy branch:', err.message);
}
