const webpack = require('webpack');
const nodeEnv = process.env.NODE_ENV || 'production';

module.exports = {
  devtool: 'soure-map',
  entry: {
    filename: './src/js/app.js'
  },
  output: {
    filename: './dist/js/stateMap.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015-native-modules']
        }
      }
    ]
  },
  plugins: [
    // uglify
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: { comments:false },
      sourceMap: true
    }),
    // environment
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
    })
  ]
};