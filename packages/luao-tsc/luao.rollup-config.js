module.exports = {
  removeHtmlFile: true,
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir:'dist'
  },
  umd: false,
}