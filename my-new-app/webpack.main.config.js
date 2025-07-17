const path = require('path');

module.exports = {
  entry: './src/main.js',
  target: 'electron-main',
  output: {
    filename: 'main.js', // ✅ prevent name conflict
    path: path.resolve(__dirname, '.webpack/main')
  },
  module: {
    rules: [
      ...require('./webpack.rules'),
      {
        test: /\.csd$/,
        type: 'asset/source'
      }
    ]
  }
};
