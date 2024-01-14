// import { join } from 'path';
// import { rimraf } from 'rimraf';
import signale from 'signale';
import rollup from './rollup';
import getUserConfig from '../utils/getUserConfig';
import { getExistFile } from '../utils/index';
import { IBundleOptions, IEsm } from '../types';
import { removeFile, removeDir } from 'luao-util'

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
const CONSTDIR = ['dist', 'es']
const removeHtmlFile = (option: IBundleOptions[]) => {
    option.forEach(element => {
        if (element.removeHtmlFile === true) { 
            // 清除html文件
            removeFile({
              fileSuffix: '.html',
              ignore:['node_modules', ...CONSTDIR]
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
}

export async function buildReact(props?: RollupBuildProps) {
  const cwd = process.cwd();
  const global = signale.scope('luao component bundler');
  try {
    await removeDir({ files:CONSTDIR })
    global.pending('开始打包');

    const bundleOpts = await getBundleOpts({ entry: props?.entry });

    const promises = bundleOpts.reduce<Array<Promise<void>>>(
      (pre, bundleOpt) => {
        // Build umd
        if (bundleOpt.umd) {
          pre.push(
            new Promise((resolve) => {
              const umd = global.scope('luao component ->UMD<-');
              umd.pending('打包UMD格式...');
              resolve(
                rollup({
                  cwd,
                  type: 'umd',
                  entry: bundleOpt.entry!,
                  bundleOpts: bundleOpt,
                }).then(() => {
                  umd.success('UMD格式打包完成');
                  removeHtmlFile(bundleOpts)
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

              esmSignale.pending('打包ESM格式...');
              resolve(
                rollup({
                  cwd,
                  type: 'esm',
                  entry: bundleOpt.entry!,
                  bundleOpts: bundleOpt,
                  importLibToEs,
                }).then(() => {
                  esmSignale.success('ESM格式打包完成');
                  removeHtmlFile(bundleOpts)
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

    global.success('打包完成');
  } catch (e) {
    global.error(e);
    process.exit(1);
  }
}
