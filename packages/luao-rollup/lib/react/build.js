import { join } from 'path';
import { rimraf } from 'rimraf';
import signale from 'signale';
import rollup from './rollup.js';
import getUserConfig from '../utils/getUserConfig.js';
import { getExistFile } from '../utils/index.js';
/**
 * 默认支持esm和umd两种格式
 */
const defaultBundleOpts = {
    esm: {
        type: 'rollup',
        minify: false,
        importLibToEs: true,
    },
    umd: {
        sourcemap: false,
    },
};
async function getBundleOpts({ entry }) {
    entry =
        entry !== null && entry !== void 0 ? entry : getExistFile([
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
export async function buildReact(props) {
    const cwd = process.cwd();
    const global = signale.scope('luao component bundler');
    try {
        await Promise.all(['dist', 'es'].map((path) => new Promise((resolve, reject) => {
            rimraf(join(cwd, path)).then(() => {
                resolve('done');
            }).catch(reject);
            // rimraf(join(cwd, path), (error) => {
            //   if (error) {
            //     reject(error);
            //   }
            //   resolve('done');
            // });
        })))
            .then(() => {
            global.success('清理输出文件夹');
        })
            .catch((err) => {
            global.error(err);
            process.exit(1);
        });
        global.pending('开始打包');
        const bundleOpts = await getBundleOpts({ entry: props === null || props === void 0 ? void 0 : props.entry });
        const promises = bundleOpts.reduce((pre, bundleOpt) => {
            // Build umd
            if (bundleOpt.umd) {
                pre.push(new Promise((resolve) => {
                    const umd = global.scope('luao component ->UMD<-');
                    umd.pending('打包UMD格式...');
                    resolve(rollup({
                        cwd,
                        type: 'umd',
                        entry: bundleOpt.entry,
                        bundleOpts: bundleOpt,
                    }).then(() => {
                        umd.success('UMD格式打包完成');
                    }));
                }));
            }
            // Build esm
            if (bundleOpt.esm) {
                pre.push(new Promise((resolve) => {
                    const esm = bundleOpt.esm;
                    const importLibToEs = esm && esm.importLibToEs;
                    const esmSignale = global.scope('luao component ->ESM<-');
                    esmSignale.pending('打包ESM格式...');
                    resolve(rollup({
                        cwd,
                        type: 'esm',
                        entry: bundleOpt.entry,
                        bundleOpts: bundleOpt,
                        importLibToEs,
                    }).then(() => {
                        esmSignale.success('ESM格式打包完成');
                    }));
                }));
            }
            return pre;
        }, []);
        while (promises.length) {
            const promise = promises.shift();
            if (promise) {
                await promise;
            }
        }
        global.success('打包完成');
    }
    catch (e) {
        global.error(e);
        process.exit(1);
    }
}
