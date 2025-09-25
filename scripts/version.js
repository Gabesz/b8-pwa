import fs from 'fs';
import path from 'path';

// Package.json olvasása
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Verziószám növelése
const versionParts = packageJson.version.split('.');
const patch = parseInt(versionParts[2]) + 1;
const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;

// Package.json frissítése
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Verziószám kiírása
console.log(`Version updated to: ${newVersion}`);

// Vite config olvasása és frissítése
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Verziószám beállítása a Vite config-ban
const versionRegex = /__APP_VERSION__:\s*JSON\.stringify\(process\.env\.npm_package_version\s*\|\|\s*['"`]([^'"`]+)['"`]\)/;
if (versionRegex.test(viteConfig)) {
  viteConfig = viteConfig.replace(versionRegex, `__APP_VERSION__: JSON.stringify(process.env.npm_package_version || '${newVersion}')`);
} else {
  // Ha nincs define, hozzáadjuk
  const defineIndex = viteConfig.indexOf('define: {');
  if (defineIndex !== -1) {
    viteConfig = viteConfig.replace(
      'define: {',
      `define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '${newVersion}'),`
    );
  }
}

fs.writeFileSync(viteConfigPath, viteConfig);
console.log(`Vite config updated with version: ${newVersion}`);
