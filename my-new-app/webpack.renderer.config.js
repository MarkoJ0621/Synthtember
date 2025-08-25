const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.wasm$/,
  type: 'asset/resource',
});

module.exports = {
  module: { rules },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/wasm'), to: 'wasm' },
        { from: path.resolve(__dirname, 'src/models'), to: 'models' }
      ],
    }),
  ],
  resolve: {
    fallback: {
      path: false,      // ← tell Webpack not to try to bundle Node's path
      fs: false,        // optional: if you use fs in renderer
      os: false,        // optional: if needed
    }
  }
};
