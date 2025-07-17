const path = require('path');

module.exports = {
    entry: './src/preload.js',
    target: 'electron-preload',
    output: {
        filename: 'preload.js', // ✅ separate output file
        path: path.resolve(__dirname, '.webpack/preload')
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
