const Path = require('path');
const Webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  output: {
    chunkFilename: 'js/[name].chunk.js'
  },
  devServer: {
    inline: true
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    rules: [
      // {
      //   test: /\.(js)$/,
      //   include: Path.resolve(__dirname, '../examples'),
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   options: {
      //     emitWarning: true,
      //   }
      // },
      {
        test: /\.(js)$/,
        include: Path.resolve(__dirname, '../examples'),
        loader: 'babel-loader'
      },
      {
        test: /\.sass$/i,
        use: ['style-loader', 'css-loader?sourceMap=true', {
          loader: 'sass-loader',
          options: {
            implementation: require("sass"),
          },
        }]
      }
    ]
  }
});
