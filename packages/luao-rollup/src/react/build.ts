import { join } from 'path';
import { rimraf } from 'rimraf';
import signale from 'signale';
import rollup from './rollup';
import getUserConfig from '../utils/getUserConfig';
import { getExistFile } from '../utils/index';
import { IBundleOptions, IEsm } from '../types';

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
    const queryAllDir = ({ fileSuffix = '.html', ignore = [...CONSTDIR, 'node_modules'] }) => {
        const rph = process.cwd();
        const dirs = fs.readdirSync(rph)
        // console.log(dirs, 'dirs');
        let stack = [...dirs]
        let Filepath = rph;
        signale.start('clear file start...')
        while (stack.length) {
            const pathnames = stack.pop()
            if (ignore.some(item => item === pathnames)) { 
                continue;
            }
            //判断是否是文件还是目录
            if (/(\.(.+)$)/g.test(pathnames)) {
                if (!new RegExp(`${fileSuffix}$`, 'g').test(pathnames)) { 
                    continue;
                }
                const htmlFile = `${Filepath}/${pathnames}`
                if (fs.existsSync(htmlFile)) {
                    rimraf(htmlFile).then(res => {
                        signale.success('clear html files');
                    }).catch(err => { 
                        signale.error(err);
                    })
                }
            } else {
                Filepath += `/${pathnames}`
                const dir = fs.readdirSync(Filepath)
                stack.push(...dir);
            }
        }
    }
    option.forEach(element => {
        if (element.removeHtmlFile === true) { 
            // 清除html文件
            queryAllDir({})
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
    await Promise.all(
      ['dist', 'es'].map(
        (path) =>
          new Promise((resolve, reject) => {
            rimraf(join(cwd, path)).then(() => { 
              resolve('done')
            }).catch(reject)
          }),
      ),
    )
      .then(() => {
        global.success('清理输出文件夹');
      })
      .catch((err) => {
        global.error(err);
        process.exit(1);
      });

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
