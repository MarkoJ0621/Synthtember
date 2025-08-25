const rules = require('./webpack.rules');
const CopyPlugin = require('copy-webpack-plugin');

// Add CSS rule to existing rules
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Add CSD rule to existing rules
rules.push({
  test: /\.csd$/,
  type: 'asset/source'
});

module.exports = {
  module: {
    rules: rules, // Use the extended rules array
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/models', to: 'models' },
        { from: 'src/wasm', to: 'wasm' }
      ],
    }),
  ],
};