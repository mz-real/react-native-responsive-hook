// Runs the example against this repository's build output (`lib/`, the same
// files that are published). Bare imports made from inside `lib/` (react,
// react-native) are resolved as if from the example, so the library's own
// dev copies in ../node_modules are never bundled.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, '..');
const libDir = path.join(libraryRoot, 'lib');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [libDir];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-responsive-hook') {
    return {
      type: 'sourceFile',
      filePath: path.join(libDir, 'module', 'index.js'),
    };
  }
  const isBareImport = !moduleName.startsWith('.') && !path.isAbsolute(moduleName);
  if (isBareImport && context.originModulePath.startsWith(libDir)) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.ts') },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
