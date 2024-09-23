import webpack from 'webpack';
import { isEmpty } from 'lodash';
import path from 'path'
import { Env } from '../type';
import Config from 'webpack-5-chain';
import { DEFAULT_BROWSER_TARGETS, ENTRY_POINT } from '../constants'

interface IOpts {
    cwd?: string;
    env: Env;
    entry?: string[];
    output?: string;
    htmlPath?: string;
    buildCache?: {
      cacheDirectory?: string;
    };
    devCache?: boolean;
    hash?: boolean;
    hmr?: boolean;
    analyze?: boolean;
    alias?: Record<string, string>;
    mdx?: boolean;
    targets?: { [key: string]: any };
    fastRefresh?: boolean;
    useHtmlWebPackPlugin?: boolean;
    /**
     * legacy为true表示兼容ie11，为false表示可运行在现代浏览器中
     */
    legacy: boolean;
    /**
     * 是否压缩
     */
    noCompression: boolean;
  }

export const getConfig = async (opts: IOpts) => {
    const isDev = opts.env === Env.development;
    const config = new Config();

    const targets = opts.targets ?? DEFAULT_BROWSER_TARGETS;

    const applyOpts = {
        ...opts,
        config,
        targets,
    };
    // mode
    config.mode(opts.env);
    config.stats(isDev ? 'errors-warnings' : 'normal');

    // entry
  const entry = config.entry(ENTRY_POINT);
//   if (!isDev) {
//     entry.add(require.resolve('./runtimePublicPathEntry'));
    //   }
    if (isEmpty(opts.entry)) {
        opts.entry = [path.join(opts.cwd!, './src')]
    }
    if (opts.entry) {
        opts.entry.forEach((_entry) => {
            entry.add(_entry);
          });
    }
    return config
}

