module.exports =  {
    removeHtmlFile: true,
    esm: {
      type: 'rollup',
      minify: false,
      importLibToEs: true,
      dir:'dist'
    },
    umd: false,
    watch: {
      exclude: 'node_modules/**',
      include: 'src/**',
      devServer: () => { }
    }
 }