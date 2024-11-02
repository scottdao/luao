export default {
  removeHtmlFile: true,

  codeBabelType: 'node', //默认React, node, vue
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir: 'dist',
  },
  umd: false,
}
