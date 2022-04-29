import express from 'express'; //your original BE server
const app = express();
import config from './webpack/webpack.config.dev.cjs';
import webpack from'webpack';
import middleware from'webpack-dev-middleware'; //webpack hot reloading middleware
const compiler = webpack(config); //move your `devServer` config from `webpack.config.js`

app.use(
  middleware(compiler, {
    // webpack-dev-middleware options
  })
);

app.listen(8080, () => console.log('Run on port 3000'));
