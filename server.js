const express = require('express'); //your original BE server
const app = express();
const config = require('./webpack/webpack.config.dev');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware'); //webpack hot reloading middleware
const compiler = webpack(config); //move your `devServer` config from `webpack.config.js`

app.use(
  middleware(compiler, {
    // webpack-dev-middleware options
  })
);

app.listen(8080, () => console.log('Run on port 3000'));
