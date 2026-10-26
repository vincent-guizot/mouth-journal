const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rnPath = path.join(projectRoot, 'node_modules', 'react-native');
const rnPackageJsonPath = path.join(rnPath, 'package.json');
const rnPolyfillPath = path.join(rnPath, 'rn-get-polyfills.js');

if (!fs.existsSync(rnPath)) {
  console.log('[patch-rn-polyfills] react-native not found in node_modules, skipping.');
  process.exit(0);
}

// 1. Create rn-get-polyfills.js if missing
const polyfillContent = `/**
 * Shim for React Native >= 0.79 / 0.88 where rn-get-polyfills was moved to @react-native/js-polyfills
 */
module.exports = function getPolyfills() {
  try {
    return require('@react-native/js-polyfills')();
  } catch (e) {
    return [];
  }
};
`;

try {
  fs.writeFileSync(rnPolyfillPath, polyfillContent, 'utf8');
  console.log('[patch-rn-polyfills] Successfully created rn-get-polyfills.js');
} catch (err) {
  console.error('[patch-rn-polyfills] Error creating rn-get-polyfills.js:', err);
}

// 2. Ensure package.json exports contains ./rn-get-polyfills and ./rn-get-polyfills.js
try {
  if (fs.existsSync(rnPackageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(rnPackageJsonPath, 'utf8'));
    pkg.exports = pkg.exports || {};
    let modified = false;

    if (!pkg.exports['./rn-get-polyfills']) {
      pkg.exports['./rn-get-polyfills'] = './rn-get-polyfills.js';
      modified = true;
    }
    if (!pkg.exports['./rn-get-polyfills.js']) {
      pkg.exports['./rn-get-polyfills.js'] = './rn-get-polyfills.js';
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(rnPackageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('[patch-rn-polyfills] Successfully updated react-native/package.json exports');
    } else {
      console.log('[patch-rn-polyfills] ./rn-get-polyfills already exists in react-native/package.json exports');
    }
  }
} catch (err) {
  console.error('[patch-rn-polyfills] Error updating react-native/package.json:', err);
}

// 3. Ensure expo re-exports all from expo-modules-core (createPermissionHook, PermissionStatus, etc.)
const expoSrcPath = path.join(projectRoot, 'node_modules', 'expo', 'src', 'Expo.ts');
const expoDtsPath = path.join(projectRoot, 'node_modules', 'expo', 'build', 'Expo.d.ts');

try {
  if (fs.existsSync(expoSrcPath)) {
    let expoSrc = fs.readFileSync(expoSrcPath, 'utf8');
    if (!expoSrc.includes("export * from 'expo-modules-core'")) {
      expoSrc = expoSrc.replace(
        /export\s*\{[^}]*\}\s*from\s*'expo-modules-core';/,
        "export * from 'expo-modules-core';\nexport { requireNativeViewManager as requireNativeView } from 'expo-modules-core';"
      );
      fs.writeFileSync(expoSrcPath, expoSrc, 'utf8');
      console.log('[patch-rn-polyfills] Successfully patched expo/src/Expo.ts to export expo-modules-core');
    } else {
      console.log('[patch-rn-polyfills] expo/src/Expo.ts already exports expo-modules-core');
    }
  }

  if (fs.existsSync(expoDtsPath)) {
    let expoDts = fs.readFileSync(expoDtsPath, 'utf8');
    if (!expoDts.includes("export * from 'expo-modules-core'")) {
      expoDts = expoDts.replace(
        /export\s*\{[^}]*\}\s*from\s*'expo-modules-core';/,
        "export * from 'expo-modules-core';\nexport { requireNativeViewManager as requireNativeView } from 'expo-modules-core';"
      );
      fs.writeFileSync(expoDtsPath, expoDts, 'utf8');
      console.log('[patch-rn-polyfills] Successfully patched expo/build/Expo.d.ts to export expo-modules-core');
    } else {
      console.log('[patch-rn-polyfills] expo/build/Expo.d.ts already exports expo-modules-core');
    }
  }
} catch (err) {
  console.error('[patch-rn-polyfills] Error patching expo re-exports:', err);
}
