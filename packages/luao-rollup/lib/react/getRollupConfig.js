"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const luao_babel_preset_1 = require("luao-babel-preset");
const rollup_plugin_visualizer_1 = require("rollup-plugin-visualizer");
const plugin_terser_1 = __importDefault(require("@rollup/plugin-terser"));
const rollup_plugin_postcss_1 = __importDefault(require("rollup-plugin-postcss"));
const plugin_replace_1 = __importDefault(require("@rollup/plugin-replace"));
const rollup_plugin_typescript2_1 = __importDefault(require("rollup-plugin-typescript2"));
const plugin_alias_1 = __importDefault(require("@rollup/plugin-alias"));
const plugin_babel_1 = __importDefault(require("@rollup/plugin-babel"));
const plugin_json_1 = __importDefault(require("@rollup/plugin-json"));
const plugin_node_resolve_1 = __importDefault(require("@rollup/plugin-node-resolve"));
const plugin_commonjs_1 = __importDefault(require("@rollup/plugin-commonjs"));
const postcss_url_1 = __importDefault(require("postcss-url"));
const plugin_strip_1 = __importDefault(require("@rollup/plugin-strip"));
const plugin_image_1 = __importDefault(require("@rollup/plugin-image"));
const rollup_1 = __importDefault(require("@svgr/rollup"));
const lodash_1 = __importDefault(require("lodash"));
const { camelCase } = lodash_1.default;
const temp_dir_1 = __importDefault(require("temp-dir"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const typescript_plugin_styled_components_1 = require("typescript-plugin-styled-components");
const onwarn = (warning) => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY' &&
        warning.code !== 'MISSING_GLOBAL_NAME') {
        console.log();
        // console.error(chalk.yellow(`(!) ${warning.message}`));
    }
};
function default_1(opts) {
    const { cwd, type, entry, bundleOpts, importLibToEs } = opts;
    const { output, extraExternals = [] } = bundleOpts;
    const entryExt = (0, path_1.extname)(entry);
    const isTypeScript = entryExt === '.ts' || entryExt === '.tsx';
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    let pkg = {};
    try {
        pkg = require((0, path_1.join)(cwd, 'package.json'));
    }
    catch (e) { }
    const babelOpts = {
        ...(0, luao_babel_preset_1.setBabelPreset)({
            presetEnv: {},
            presetReact: {},
            presetTypeScript: {},
            pluginTransformRuntime: type === 'esm' ? {} : undefined,
            type,
            projectType: 'React'
        }),
        babelHelpers: type === 'esm'
            ? 'runtime'
            : 'bundled',
        babelrc: false,
        extensions,
        exclude: /\/node_modules\//,
    };
    if (importLibToEs && type === 'esm') {
        babelOpts.plugins.push(require.resolve('../dist/utils/importLibToEs'));
    }
    const input = (0, path_1.join)(cwd, entry);
    const format = type;
    const packageDependencies = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
    const external = function (id) {
        return (packageDependencies.some((dependencyKey) => dependencyKey === id || id.indexOf(`${dependencyKey}/`) === 0) ||
            (extraExternals || []).includes(id) ||
            id.indexOf('/.pnpm/') >= 0);
    };
    const terserOpts = {
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
        },
    };
    function getPlugins(opts = {}) {
        const { minCSS, outputPath } = opts;
        return [
            (0, plugin_commonjs_1.default)({
                include: /node_modules/,
            }),
            (0, rollup_plugin_visualizer_1.visualizer)(),
            (0, plugin_strip_1.default)({
                functions: ['console.*', 'assert.*', 'module.hot.accept'],
            }),
            (0, rollup_1.default)(),
            (0, rollup_plugin_postcss_1.default)({
                extensions: ['.css', '.scss', '.less'],
                extract: true,
                inject: true,
                modules: false,
                autoModules: false,
                minimize: !!minCSS,
                use: ['sass', 'less'],
                plugins: [
                    // 先处理@import
                    require('postcss-import')(),
                    // 将小于10kb的资源转换成base64，大于10kb输出到static文件夹下
                    (0, postcss_url_1.default)({
                        url: 'inline',
                        maxSize: 10,
                        filter: /\.(woff2?|eot|ttf|otf|png|jpe?g|gif|svg)(\?.*)?$/,
                        fallback({ absolutePath }) {
                            const dist = (0, path_1.resolve)(outputPath);
                            if (!fs_1.default.existsSync(dist)) {
                                fs_1.default.mkdirSync(dist);
                            }
                            const staticPath = 'static';
                            const destpath = (0, path_1.resolve)(dist, staticPath);
                            if (!fs_1.default.existsSync(destpath)) {
                                fs_1.default.mkdirSync(destpath);
                            }
                            const destpathWithAsset = (0, path_1.resolve)(destpath, (0, path_1.basename)(absolutePath));
                            fs_1.default.copyFileSync(absolutePath, destpathWithAsset);
                            return `${staticPath}/${(0, path_1.basename)(absolutePath)}`;
                        },
                        assetsPath: `${outputPath}/static/`,
                    }),
                    require('postcss-flexbugs-fixes'),
                    (0, autoprefixer_1.default)({
                        remove: false,
                        flexbox: 'no-2009',
                    }),
                ],
            }),
            (0, plugin_node_resolve_1.default)({
                mainFields: ['module', 'jsnext:main', 'main'],
                extensions,
            }),
            ...(isTypeScript
                ? [
                    (0, rollup_plugin_typescript2_1.default)({
                        cwd,
                        clean: true,
                        cacheRoot: `${temp_dir_1.default}/.rollup_plugin_typescript2_cache`,
                        tsconfig: (0, path_1.join)(cwd, 'tsconfig.json'),
                        tsconfigDefaults: {
                            compilerOptions: {
                                // Generate declaration files by default
                                declaration: true,
                            },
                        },
                        tsconfigOverride: {
                            compilerOptions: {
                                // Support dynamic import
                                target: 'esnext',
                            },
                        },
                        transformers: [
                            () => ({
                                before: [(0, typescript_plugin_styled_components_1.createTransformer)()],
                            }),
                        ],
                        check: true,
                    }),
                ]
                : []),
            (0, plugin_babel_1.default)(babelOpts),
            (0, plugin_json_1.default)(),
            (0, plugin_image_1.default)(),
            (0, plugin_alias_1.default)({
                entries: { '@': (0, path_1.resolve)('./src') },
            }),
        ];
    }
    switch (type) {
        case 'esm':
            return [
                {
                    input,
                    output: {
                        format,
                        ...(output || {}),
                        file: (0, path_1.join)(cwd, `es/${(output && output.file) || 'index.js'}`),
                    },
                    onwarn,
                    plugins: [...getPlugins({ outputPath: 'es' })],
                    external,
                },
            ];
        case 'umd':
            return [
                {
                    input,
                    output: {
                        format,
                        name: pkg.name && camelCase((0, path_1.basename)(pkg.name)),
                        ...(output || {}),
                        file: (0, path_1.join)(cwd, `dist/${(output && output.file) || 'index.js'}`),
                    },
                    onwarn,
                    plugins: [
                        ...getPlugins({ minCSS: true, outputPath: 'dist' }),
                        (0, plugin_replace_1.default)({
                            'process.env.NODE_ENV': JSON.stringify('production'),
                        }),
                        (0, plugin_terser_1.default)(terserOpts),
                    ],
                    external,
                },
            ];
        default:
            throw new Error(`Unsupported type ${type}`);
    }
}
exports.default = default_1;
