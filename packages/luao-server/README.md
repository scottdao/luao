#### luao-server

- rollup tools

### 快速上手

```js
  npm install luao-server
```

#### rollup 打包 配置

- `package.json`

```json

  "scripts": {
    "build:test": "luao-server rollup"
  },
```

配置示例 `luao.rollup-config.js`

```js
export default {
  removeHtmlFile: true,

  codeBabelType: 'node', //默认React; 支持React,node
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir: 'dist',
  },
  umd: false,
}
```
