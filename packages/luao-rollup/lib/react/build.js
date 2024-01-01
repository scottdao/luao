"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReact = void 0;
const path_1 = require("path");
const rimraf_1 = require("rimraf");
const signale_1 = __importDefault(require("signale"));
const rollup_1 = __importDefault(require("./rollup"));
const getUserConfig_1 = __importDefault(require("../utils/getUserConfig"));
const index_1 = require("../utils/index");
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
        entry !== null && entry !== void 0 ? entry : (0, index_1.getExistFile)([
            'src/index.tsx',
            'src/index.ts',
            'src/index.jsx',
            'src/index.js',
        ]);
    const userConfig = await (0, getUserConfig_1.default)();
    const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
    return userConfigs.map((_userConfig) => ({
        entry,
        ...defaultBundleOpts,
        ..._userConfig,
    }));
}
async function buildReact(props) {
    const cwd = process.cwd();
    const global = signale_1.default.scope('luao component bundler');
    try {
        await Promise.all(['dist', 'es'].map((path) => new Promise((resolve, reject) => {
            (0, rimraf_1.rimraf)((0, path_1.join)(cwd, path)).then(() => {
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
                    resolve((0, rollup_1.default)({
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
                    resolve((0, rollup_1.default)({
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
exports.buildReact = buildReact;
