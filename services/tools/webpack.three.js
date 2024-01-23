const path = require('path');

module.exports = {
  mode: "production", // enable many optimizations for production build

  entry: './services/tools/three.bundle.js',
  
  output: {
    path: path.resolve(__dirname, '../../public/dist'),
    filename: 'THREE.bundle.js',
  },
  //optimization: { minimize: false },
};