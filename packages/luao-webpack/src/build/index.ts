import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import { getUserConfig } from '../utils/get-user-config'

import { Env, Mode, WebpackConfig } from '../type/index';

type IOpts = {
    // mode: Mode;
    cwd?: string;
    // entry: string[];
    // output?: string;
    // alias: Record<string, string>;
    // externals: WebpackConfig['externals'];
    // analyze?: boolean;
    buildCache?: boolean;
    // useHtmlWebPackPlugin?: boolean;
    // mdx?: boolean;
    // legacy: boolean;
    // noCompression: boolean;
};
// const isMonorepo = ({ cwd }: { cwd: string }) => {
//     return (
//       fs.existsSync(path.join(cwd, '..', '..', 'lerna.json')) &&
//       fs.existsSync(path.join(cwd, '..', '..', 'node_modules'))
//     );
// };
export const build = async (opts: IOpts): Promise<webpack.Stats> => {
  let cacheDirectory: string | undefined;
  if (opts.buildCache) {
      cacheDirectory = path.join(opts.cwd!, 'cache');
  }
  const userConfig = await getUserConfig()
  console.log(userConfig, 'userConfig');
  return new Promise((resolve, reject) => { })
}