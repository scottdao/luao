export default {
  removeHtmlFile: true,
  //   treeshake: {
  //     preset: 'smallest',
  //     propertyReadSideEffects: true
  // },
  codeBabelType: 'react', //默认React, node, vue
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir: 'dist',
  },
  umd: false,
}
