import _objectSpread from '/Users/scottliu/Documents/study/github/luao/node_modules/.pnpm/@babel+runtime@7.23.7/node_modules/@babel/runtime/helpers/objectSpread2.js';
import { dirname } from 'path';

var baseOptionsMap = new Map([['React', function (options) {
  return {
    presets: [[require.resolve('@babel/preset-env'), _objectSpread({
      bugfixes: true,
      // 更兼容 spec，但会变慢，所以不开
      spec: false,
      // 推荐用 top level 的 assumptions 配置
      loose: false,
      // 保留 es modules 语法，交给 webpack 处理
      modules: false,
      debug: false,
      useBuiltIns: 'entry',
      corejs: 3,
      // 没必要，遇到了应该改 targets 配置
      forceAllTransforms: false,
      ignoreBrowserslistConfig: true
    }, options.presetEnv)], [require.resolve('@babel/preset-react'), _objectSpread({}, options.presetReact)], [require.resolve('@babel/preset-typescript'), _objectSpread({
      allExtensions: false,
      isTSX: false
    }, options.presetTypeScript)]],
    plugins: [require.resolve('@babel/plugin-proposal-export-default-from'), require.resolve('babel-plugin-const-enum'),
    // [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('babel-plugin-styled-components'), {
      ssr: false,
      displayName: true,
      fileName: false,
      minify: true,
      pure: true
    }], [require.resolve('@babel/plugin-transform-class-properties'), {
      loose: true
    }], options.pluginTransformRuntime && [require.resolve('@babel/plugin-transform-runtime'), _objectSpread({
      helpers: true,
      regenerator: true,
      absoluteRuntime: dirname(require.resolve('../package.json')),
      version: '^7.23.7'
    }, options.pluginTransformRuntime)]].filter(Boolean)
  };
}]]);
var setBabelPreset = function setBabelPreset(options) {
  var _a, _b;
  options.projectType = options.projectType || 'React';
  return (_b = (_a = baseOptionsMap === null || baseOptionsMap === void 0 ? void 0 : baseOptionsMap.get) === null || _a === void 0 ? void 0 : _a.call(baseOptionsMap, options.projectType)) === null || _b === void 0 ? void 0 : _b({
    presetEnv: options.presetEnv,
    presetReact: options.presetReact,
    presetTypeScript: options.presetTypeScript,
    pluginTransformRuntime: options.pluginTransformRuntime,
    type: options === null || options === void 0 ? void 0 : options.type
  });
};

export { setBabelPreset };
