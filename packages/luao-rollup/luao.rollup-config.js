export default {
  removeHtmlFile: true,
//   treeshake: {
//     preset: 'smallest',
//     propertyReadSideEffects: true
// },
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir:'dist'
  },
  umd: false,
 }