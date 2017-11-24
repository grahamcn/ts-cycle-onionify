// https://stanko.github.io/webpack-babel-react-revisited/

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')

const isDevelopment = process.env.NODE_ENV === "development"

const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src'),
}

const extractSass = new ExtractTextPlugin({
  filename: "styles.css",
  disable: isDevelopment,
});

const envPlugins = isDevelopment ? [] :
	// production plugins:
	[new UglifyJSPlugin()]

module.exports = {
  entry: path.join(paths.JS, './ts/app.ts'),
  output: {
    path: paths.DIST,
    filename: 'app.bundle.js',
	},
	devtool: 'inline-source-map', // on, irrespective of node env at present.
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
    }),
		extractSass,
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
  ].concat([...envPlugins]),
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
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          'file-loader',
          `image-webpack-loader?{
            optipng: {
              optimizationLevel: 7,
            },
            gifsicle: {
              interlaced: false,
            },
            pngquant:{
              quality: "1-100",
              speed: 4,
            },
            mozjpeg: {
              quality: 65
            },
            webp: {
              quality: 75
            }
          }`,
        ],
      },
    ],
  },
  // use our "src" folder as a starting point - unrequired at present as HtmlWebpackPlugin
  // handles this
  devServer: {
		contentBase: paths.SRC,
		hot: true,
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
