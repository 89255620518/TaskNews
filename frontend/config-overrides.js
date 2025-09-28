const webpack = require('webpack');

module.exports = function override(config, env) {
  // Решаем проблему с полифилами
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "url": require.resolve("url/"),
    "querystring": require.resolve("querystring-es3"),
    "fs": false,
    "path": false,
    "os": false,
    "http": false,
    "https": false,
    "zlib": false,
    "net": false,
    "tls": false,
    "child_process": false
  };

  // Добавляем плагины для глобальных переменных
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
      crypto: 'crypto-browserify'
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_JWT_SECRET': JSON.stringify(process.env.JWT_SECRET || 'fallback-secret-key'),
      'process.env.REACT_APP_JWT_REFRESH_SECRET': JSON.stringify(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key')
    })
  ]);

  return config;
};