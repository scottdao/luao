#### luao-babel-preset
- 基于babel定义的插件函数
- 目前版本只支持react工程
- setBabelPreset 调用该函数
 - presetEnv: 基于@babel/preset-env参数配置
 - presetReact：基于@babel/preset-react参数属性值配置
 - presetTypeScript：基于@babel/preset-typescript参数属性值配置
 - pluginTransformRuntime：基于@babel/plugin-transform-runtime参数属性值配置
 - projectType：支持项目工程，目前只能设置React