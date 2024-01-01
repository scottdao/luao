#### luao-tsc-suffix
##### 基于typescript的插件指令集
- 主要功能基于tsc编译后添加文件后缀名
```ts
    pnpm add -D luao-tsc
```
- 配置
```package.json
 "scripts": {
    "build": "luao-tsc",
  },
```
```tsconfig.json
{
  ...
  "luaoOutDir":["lib"],
  "luaoOutFileSuffix":".js"
}
```