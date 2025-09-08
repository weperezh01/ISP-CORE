const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();

  return {
    resolver: {
      assetExts: [...assetExts, 'svg'],
      sourceExts: [...sourceExts, 'js', 'json', 'ts', 'tsx', 'jsx']
    }
  };
})();
