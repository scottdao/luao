#### luao-rollup

### 修复打包报错

### 示例

```js
import { buildReact } from '../dist/index.js'
buildReact()
```

- 配置示例 `luao.rollup-config.js`

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
