const rules = require('./webpack.rules');
const CopyPlugin = require('copy-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules: [{
      test: /\.csd$/,
      type: 'asset/source'
    }]
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