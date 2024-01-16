import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';

import { Env, Mode, WebpackConfig } from '../type/index';

type IOpts = {
    mode: Mode;
    cwd: string;
    entry: string[];
    output?: string;
    alias: Record<string, string>;
    externals: WebpackConfig['externals'];
    analyze?: boolean;
    buildCache?: boolean;
    useHtmlWebPackPlugin?: boolean;
    mdx?: boolean;
    legacy: boolean;
    noCompression: boolean;
};
const isMonorepo = ({ cwd }: { cwd: string }) => {
    return (
      fs.existsSync(path.join(cwd, '..', '..', 'lerna.json')) &&
      fs.existsSync(path.join(cwd, '..', '..', 'node_modules'))
    );
};
export const buildReact = async (opts: IOpts): Promise<webpack.Stats> => {
    process.env.NODE_ENV = 'production';

  let cacheDirectory: string | undefined;
  if (opts.buildCache) {
    if (isMonorepo({ cwd: opts.cwd })) {
      cacheDirectory = path.join(opts.cwd, '..', '..', 'cache');
    } else {
      cacheDirectory = path.join(opts.cwd, 'cache');
    }
  }
    return new Promise((resolve, reject) => { })
 }