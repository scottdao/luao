import { dirname } from 'path';


interface IOptions {
    presetEnv: any;
    presetReact: any;
    presetTypeScript: any;
    pluginTransformRuntime: any;
    type?: string;
    projectType?:"React"
}
type baseMapType = Omit<IOptions, 'projectType'>;

const baseOptionsMap: Map<string,(opts:baseMapType)=>any> = new Map([
    ['React',
        (options: baseMapType) => {
            return {
                presets: [
                [
                    require.resolve('@babel/preset-env'),
                    {
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
                    ignoreBrowserslistConfig: true,
                    ...options.presetEnv,
                    },
                ],
                [
                    require.resolve('@babel/preset-react'),
                    {
                    ...options.presetReact,
                    },
                ],
                [
                    require.resolve('@babel/preset-typescript'),
                    {
                    allExtensions: false,
                    isTSX: false,
                    ...options.presetTypeScript,
                    },
                ],
                ],
                plugins: [
                require.resolve('@babel/plugin-proposal-export-default-from'),
                require.resolve('babel-plugin-const-enum'),
                // [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
                [
                    require.resolve('babel-plugin-styled-components'),
                    {
                    ssr: false,
                    displayName: true,
                    fileName: false,
                    minify: true,
                    pure: true,
                    },
                    ],
                [require.resolve('@babel/plugin-transform-class-properties'), { loose: true }],
                options.pluginTransformRuntime && [
                    require.resolve('@babel/plugin-transform-runtime'),
                    {
                    helpers: true,
                    regenerator: true,
                    absoluteRuntime: dirname(require.resolve('../package.json')),
                    version: '^7.23.7',
                    ...options.pluginTransformRuntime,
                    },
                ],
                ].filter(Boolean),
            };
        }
    ]
])
export const setBabelPreset = (options: IOptions) => {
    options.projectType = options.projectType || 'React'
    return baseOptionsMap?.get?.(options.projectType)?.({
        presetEnv: options.presetEnv,
        presetReact: options.presetReact,
        presetTypeScript: options.presetTypeScript,
        pluginTransformRuntime: options.pluginTransformRuntime,
        type:options?.type
    })
}