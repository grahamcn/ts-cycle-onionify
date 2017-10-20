const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src'),
}

const extractSass = new ExtractTextPlugin({
  filename: "styles.css",
  disable: false //process.env.NODE_ENV === "development"
});

module.exports = {
  entry: path.join(paths.JS, 'app.ts'),
  output: {
    path: paths.DIST,
    filename: 'app.bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
    }),
    extractSass,
    new UglifyJSPlugin(),
  ],
  // We are telling webpack to use "ts-loader", "babel-loader" for .js and .ts files
  // babel will do es6 => es5, ts-loader will first transpile typescript to es6 (tsconfig setting)
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'ts-loader',
        ],
      },
      // CSS loader to CSS files -> ADDED IN THIS STEP
      // Files will get handled by css loader and then passed to the extract text plugin
      // which will write it to the file we defined above
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [{
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }],
            // use style-loader in development
            fallback: "style-loader"
        }),
      }
    ],
  },
  // use our "src" folder as a starting point - unrequired at present as HtmlWebpackPlugin
  // handles this
  devServer: {
    contentBase: paths.SRC,
  },
  // Enable importing JS files without specifying their extenstion
  // So we can write:
  // import MyComponent from './my-component';
  // Instead of:
  // import MyComponent from './my-component.js';
  resolve: {
    extensions: ['.js', '.ts'],
  },
}
