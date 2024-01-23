const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "production", // enable many optimizations for production build

  entry: {
    'ATON.min': './public/src/ATON.js',
    'hathor': './public/hathor/hathor.js',
    // 'demo': './public/img_receiver/demo.js'
  },
  
  output: {
    path: path.resolve(__dirname, '../../public/dist'),
    filename: '[name].js',
  },
  plugins: [
    /*new HtmlWebpackPlugin({
      title: 'My App',
      template: 'demo.html',
      filename: 'demo.html'
    }),*/
    /*new HtmlWebpackPlugin({
      title: 'My App',
      template: 'public/hathor/index.html',
      filename: 'index.html'
    })*/
  ]
};