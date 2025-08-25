const path = require('path');

module.exports = {
  entry: './src/main.js', // Make sure this points to the correct file
  target: 'electron-main',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '.webpack'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
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