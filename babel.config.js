module.exports = function(api) {
  api.cache(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Strip console.* dalle build di produzione (in dev restano per il debug).
      // console.error/warn preservati: segnalano problemi reali anche in prod.
      ...(isProduction
        ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
        : []),
      // Reanimated plugin must be last but is incompatible with jest (requires react-native-worklets)
      ...(!isTest ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
