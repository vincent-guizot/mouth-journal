import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Asset Integrity Check', () => {
  test('all required assets in src/config/assets.ts exist on disk', () => {
    const assetsFile = path.resolve(__dirname, '../../src/config/assets.ts');
    const content = fs.readFileSync(assetsFile, 'utf-8');

    const regex = /require\(['"](\.\.\/\.\.\/assets\/[^'"]+)['"]\)/g;
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = regex.exec(content)) !== null) {
      count++;
      const relativePath = match[1];
      const absolutePath = path.resolve(path.dirname(assetsFile), relativePath);
      assert.equal(
        fs.existsSync(absolutePath),
        true,
        `Asset file missing on disk: ${relativePath} (resolved to ${absolutePath})`
      );
    }

    assert.ok(count >= 50, `Expected at least 50 asset declarations, found ${count}`);
  });

  test('all icon and splash assets declared in app.json exist on disk', () => {
    const appJsonFile = path.resolve(__dirname, '../../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonFile, 'utf-8'));
    const expo = appJson.expo;

    const rootDir = path.resolve(__dirname, '../..');

    const checkPath = (relPath: string | undefined, label: string) => {
      if (!relPath) return;
      const fullPath = path.resolve(rootDir, relPath);
      assert.equal(
        fs.existsSync(fullPath),
        true,
        `${label} specified in app.json does not exist: ${relPath}`
      );
    };

    checkPath(expo.icon, 'App icon');
    checkPath(expo.android?.adaptiveIcon?.foregroundImage, 'Adaptive foreground');
    checkPath(expo.android?.adaptiveIcon?.backgroundImage, 'Adaptive background');
    checkPath(expo.android?.adaptiveIcon?.monochromeImage, 'Adaptive monochrome');
    checkPath(expo.web?.favicon, 'Web favicon');
    if (expo.splash?.image) {
      checkPath(expo.splash.image, 'Splash image');
    }
  });

  test('direct image requires in components exist on disk', () => {
    const headerFile = path.resolve(__dirname, '../../src/components/Header.tsx');
    const splashFile = path.resolve(__dirname, '../../src/screens/SplashScreen.tsx');

    for (const file of [headerFile, splashFile]) {
      const content = fs.readFileSync(file, 'utf-8');
      const regex = /require\(['"](\.\.\/[^'"]+)['"]\)/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const fullPath = path.resolve(path.dirname(file), match[1]);
        assert.equal(fs.existsSync(fullPath), true, `Missing direct asset required in ${file}: ${match[1]}`);
      }
    }
  });
});
