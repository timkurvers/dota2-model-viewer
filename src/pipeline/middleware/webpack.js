/* eslint-disable import/no-extraneous-dependencies */

import middleware from 'webpack-dev-middleware';
import webpack from 'webpack';

import config from '../../../webpack.config.cjs';

export default () => {
  const compiler = webpack(config);
  return middleware(compiler);
};
