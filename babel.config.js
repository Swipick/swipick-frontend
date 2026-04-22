module.exports = function(api) {
  api.cache(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin must be last but is incompatible with jest (requires react-native-worklets)
      ...(!isTest ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
