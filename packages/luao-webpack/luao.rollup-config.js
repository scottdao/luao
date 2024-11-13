module.exports = {
  removeHtmlFile: true,
  codeBabelType: 'node',
  esm: {
    type: 'rollup',
    minify: false,
    importLibToEs: true,
    dir: 'dist',
  },
  umd: false,
}
