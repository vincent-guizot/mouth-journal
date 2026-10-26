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

// 2. Ensure package.json exports contains ./rn-get-polyfills
try {
  if (fs.existsSync(rnPackageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(rnPackageJsonPath, 'utf8'));
    pkg.exports = pkg.exports || {};
    if (!pkg.exports['./rn-get-polyfills']) {
      pkg.exports['./rn-get-polyfills'] = './rn-get-polyfills.js';
      fs.writeFileSync(rnPackageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('[patch-rn-polyfills] Successfully added ./rn-get-polyfills to react-native/package.json exports');
    } else {
      console.log('[patch-rn-polyfills] ./rn-get-polyfills already exists in react-native/package.json exports');
    }
  }
} catch (err) {
  console.error('[patch-rn-polyfills] Error updating react-native/package.json:', err);
}
