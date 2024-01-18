// import { join } from 'path';
// import { rimraf } from 'rimraf';
import signale from 'signale';
import rollup from './rollup';
import watchRollup from './watch';
import getUserConfig from '../utils/getUserConfig';
import { getExistFile } from '../utils/index';
import { IBundleOptions, IEsm } from '../types';
import util from 'luao-util';
import _ from 'lodash';
const { removeFile, removeDir } = util;
const { uniq } = _
/**
 * 默认支持esm和umd两种格式
 */
const defaultBundleOpts: IBundleOptions = {
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
  },
  umd: {
    sourcemap: false,
  },
};
let CONSTDIR = ['dist', 'es']
const removeHtmlFile = (option: IBundleOptions[], CONSTDIR: string[]) => {
    option.forEach(element => {
        if (element.removeHtmlFile === true) {
          // 清除html文件
            removeFile({
              fileSuffix: '.html',
              ignore:['node_modules',...CONSTDIR]
            })
        }
    });
}
async function getBundleOpts({ entry }: { entry?: string }):Promise<IBundleOptions[]>  {
  entry =
    entry ??
    getExistFile([
      'src/index.tsx',
      'src/index.ts',
      'src/index.jsx',
      'src/index.js',
    ]);
  const userConfig = await getUserConfig();
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((_userConfig) => ({
    entry,
    ...defaultBundleOpts,
    ..._userConfig,
  }));
}

interface RollupBuildProps {
  entry?: string;
  w?: true | undefined;
}

export async function buildReact(props?: RollupBuildProps) {
  const cwd = process.cwd();
  try {
    const bundleOpts = await getBundleOpts({ entry: props?.entry });
    bundleOpts.forEach(item => { 
      if (item.esm !== 'rollup' && item.esm !== false && item?.esm?.dir) { 
          CONSTDIR.push(item?.esm?.dir)
        }
        if ( item.umd !== false && item?.umd?.dir) { 
          CONSTDIR.push(item?.umd?.dir)
        }
    })
    CONSTDIR = uniq(CONSTDIR)
    if (props?.w) {
      await removeHtmlFile(bundleOpts, CONSTDIR)
      await removeDir({ files: CONSTDIR })
      watchRollup(bundleOpts, { cwd, type:'umd'})
    } else {
      const global = signale.scope('luao component bundler');
      await removeDir({ files: CONSTDIR })
      global.pending('building start...');
      const promises = bundleOpts.reduce<Array<Promise<void>>>(
        (pre, bundleOpt) => {
          // Build umd
          if (bundleOpt.umd) {
            pre.push(
              new Promise((resolve) => {
                const umd = global.scope('luao component ->UMD<-');
                umd.pending('building UMD format...');
                resolve(
                  rollup({
                    cwd,
                    type: 'umd',
                    entry: bundleOpt.entry!,
                    bundleOpts: bundleOpt,
                    outDir:( bundleOpt.umd !== false && bundleOpt?.umd?.dir)?bundleOpt?.umd?.dir:'dist',
                  }).then(() => {
                    umd.success('UMD format building complete!');
                    removeHtmlFile(bundleOpts, CONSTDIR)
                  }),
                );
              }),
            );
          }

          // Build esm
          if (bundleOpt.esm) {
            pre.push(
              new Promise((resolve) => {
                const esm = bundleOpt.esm as IEsm;
                const importLibToEs = esm && esm.importLibToEs;
                const esmSignale = global.scope('luao component ->ESM<-');
                esmSignale.pending('building ESM format...');
                resolve(
                  rollup({
                    cwd,
                    type: 'esm',
                    entry: bundleOpt.entry!,
                    bundleOpts: bundleOpt,
                    importLibToEs,
                    outDir:(bundleOpt.esm !== 'rollup' &&bundleOpt.esm !== false && bundleOpt?.esm?.dir)?bundleOpt?.esm?.dir:'es',
                  }).then(() => {
                    esmSignale.success('ESM format building complete');
                    removeHtmlFile(bundleOpts, CONSTDIR)
                  }),
                );
              }),
            );
          }

          return pre;
        },
        [],
      );

      while (promises.length) {
        const promise = promises.shift();
        if (promise) {
          await promise;
        }
      }
      global.success('building complete');
    }
  } catch (e) {
    signale.error(e);
    process.exit(1);
  }
}
