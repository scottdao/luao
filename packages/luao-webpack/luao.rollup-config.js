module.exports =  {
    removeHtmlFile: true,
    watch: {
      exclude: 'node_modules/**',
        include: 'src/**',
        devServer: () => { }
    }
 }