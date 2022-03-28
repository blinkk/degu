const Path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');



var examplePages = [];
fs.readdirSync(Path.resolve(__dirname, '../examples/')).forEach((file) => {
  var fileName = file.replace(/^.*[\\\/]/, '');
  if (!fileName.endsWith('html')) {
    return;
  }

  var htmlPage = new HtmlWebpackPlugin({
    filename: fileName,
    template: Path.resolve(__dirname, `../examples/${fileName}`)
  });
  examplePages.push(htmlPage);
});


module.exports = {
  entry: {
    app: Path.resolve(__dirname, '../examples/scripts/index.js')
  },
  output: {
    path: Path.join(__dirname, '../examples/build'),
    filename: 'js/[name].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: Path.resolve(__dirname, '../examples/public'), to: 'public' }
    ]),
    // new HtmlWebpackPlugin({
    //   template: Path.resolve(__dirname, '../examples/index.html')
    // })
  ].concat(
    examplePages
  ),
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../examples')
    }
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }
      },
    ]
  }
};
