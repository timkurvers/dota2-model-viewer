/* eslint-disable import/prefer-default-export */

import path from 'path';

export const changeExtension = (fqpath, extension) => {
  const current = path.extname(fqpath);
  if (extension && current !== extension) {
    const dirname = path.dirname(fqpath);
    const basename = path.basename(fqpath, current);
    return path.join(dirname, `${basename}${extension}`);
  }
  return fqpath;
};
