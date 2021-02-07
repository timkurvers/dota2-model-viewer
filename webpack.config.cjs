/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  mode: env,
  entry: './src/web/viewer/index.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'dota2-model-viewer-[name]-[chunkhash:8].js',
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool: env === 'development' ? 'inline-cheap-source-map' : false,
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      inject: true,
      template: './src/web/index.html',
    }),
  ],
};
