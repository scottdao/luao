import fs from 'fs';
import { basename, extname, join, resolve } from 'path';
import { setBabelPreset } from 'luao-babel-preset';
import { ModuleFormat, RollupOptions } from 'rollup';
import { visualizer } from 'rollup-plugin-visualizer';
import  terser  from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import typescript2 from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import url from 'postcss-url';
import strip from '@rollup/plugin-strip';
import image from '@rollup/plugin-image';
import svgr from '@svgr/rollup';
import { camelCase } from 'lodash';
import tempDir from 'temp-dir';
import autoprefixer from 'autoprefixer';
import { createTransformer } from 'typescript-plugin-styled-components';
import { IBundleOptions } from '../types';

interface IGetRollupConfigOpts {
  cwd: string;
  entry: string;
  type: ModuleFormat;
  importLibToEs?: boolean;
  bundleOpts: IBundleOptions;
}

interface IPkg {
  dependencies?: Record<string, any>;
  peerDependencies?: Record<string, any>;
  name?: string;
}

const onwarn: RollupOptions['onwarn'] = (warning) => {
  if (
    warning.code !== 'CIRCULAR_DEPENDENCY' &&
    warning.code !== 'MISSING_GLOBAL_NAME'
  ) {
    console.log();
    // console.error(chalk.yellow(`(!) ${warning.message}`));
  }
};

export default function (opts: IGetRollupConfigOpts): RollupOptions[] {
  const { cwd, type, entry, bundleOpts, importLibToEs } = opts;
  const { output, extraExternals = [] } = bundleOpts;

  const entryExt = extname(entry);
  const isTypeScript = entryExt === '.ts' || entryExt === '.tsx';
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  let pkg: IPkg = {};
  try {
    pkg = require(join(cwd, 'package.json'));
  } catch (e) {}

  const babelOpts = {
    ...setBabelPreset({
      presetEnv: {},
      presetReact: {},
      presetTypeScript: {},
      pluginTransformRuntime: type === 'esm' ? {} : undefined,
      type,
      projectType:'React'
    }),
    babelHelpers:
      type === 'esm'
        ? 'runtime'
        : ('bundled' as RollupBabelInputPluginOptions['babelHelpers']),
    babelrc: false,
    extensions,
    exclude: /\/node_modules\//,
  };
  if (importLibToEs && type === 'esm') {
    babelOpts.plugins.push(require.resolve('../dist/utils/importLibToEs'));
  }

  const input = join(cwd, entry);
  const format = type;

  const packageDependencies = Object.keys(pkg.dependencies || {}).concat(
    Object.keys(pkg.peerDependencies || {}),
  );

  const external = function (id: string) {
    return (
      packageDependencies.some(
        (dependencyKey) =>
          dependencyKey === id || id.indexOf(`${dependencyKey}/`) === 0,
      ) ||
      (extraExternals || []).includes(id) ||
      id.indexOf('/.pnpm/') >= 0
    );
  };

  const terserOpts = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  };

  function getPlugins(opts = {} as { minCSS?: boolean; outputPath: string }) {
    const { minCSS, outputPath } = opts;
    return [
      commonjs({
        include: /node_modules/,
      }),
      visualizer(),
      strip({
        functions: ['console.*', 'assert.*', 'module.hot.accept'],
      }),
      svgr(),
      postcss({
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
          url({
            url: 'inline',
            maxSize: 10,
            filter: /\.(woff2?|eot|ttf|otf|png|jpe?g|gif|svg)(\?.*)?$/,
            fallback({ absolutePath }) {
              const dist = resolve(outputPath);
              if (!fs.existsSync(dist)) {
                fs.mkdirSync(dist);
              }
              const staticPath = 'static';
              const destpath = resolve(dist, staticPath);
              if (!fs.existsSync(destpath)) {
                fs.mkdirSync(destpath);
              }
              const destpathWithAsset = resolve(
                destpath,
                basename(absolutePath!),
              );
              fs.copyFileSync(absolutePath!, destpathWithAsset);
              return `${staticPath}/${basename(absolutePath!)}`;
            },
            assetsPath: `${outputPath}/static/`,
          }),
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            remove: false,
            flexbox: 'no-2009',
          }),
        ],
      }),
      nodeResolve({
        mainFields: ['module', 'jsnext:main', 'main'],
        extensions,
      }),
      ...(isTypeScript
        ? [
            typescript2({
              cwd,
              clean: true,
              cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
              tsconfig: join(cwd, 'tsconfig.json'),
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
                  before: [createTransformer()],
                }),
              ],
              check: true,
            }),
          ]
        : []),
      babel(babelOpts),
      json(),
      image(),
      alias({
        entries: { '@': resolve('./src') },
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
            file: join(cwd, `es/${(output && output.file) || 'index.js'}`),
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
            name: pkg.name && camelCase(basename(pkg.name)),
            ...(output || {}),
            file: join(cwd, `dist/${(output && output.file) || 'index.js'}`),
          },
          onwarn,
          plugins: [
            ...getPlugins({ minCSS: true, outputPath: 'dist' }),
            replace({
              'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            terser(terserOpts),
          ],
          external,
        },
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
}
