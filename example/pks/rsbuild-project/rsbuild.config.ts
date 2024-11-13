import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginSvgr } from '@rsbuild/plugin-svgr'
import { pluginSass } from '@rsbuild/plugin-sass'
import path from 'path'

export default defineConfig({
  plugins: [
    pluginReact({
      fastRefresh: true,
    }),
    pluginSass({
      sassLoaderOptions: {
        api: 'legacy',
      },
    }),
    pluginLess(),
    pluginSvgr({
      // 支持 import svg 混合导入
      mixedImport: true,
      svgrOptions: {
        exportType: 'named',
      },
    }),
  ],
  dev: {
    // 与本地开发有关的选项
  },
  html: {
    /***
     * https://rsbuild.dev/zh/guide/basic/html-template
     *
     */
    mountId: 'root',
    // 与 HTML 生成有关的选项
  },
  tools: {
    // 与底层工具有关的选项
    rspack: (config, { isDev }) => {
      // if (env === 'development') {
      //   config.devtool = 'cheap-module-eval-source-map'
      // }
      if (isDev) {
        config.devtool = 'eval-cheap-source-map'
      }
      config.resolve.extensions = ['.js', '.json', '.jsx', '.tsx', '.ts']
      return config
    },
  },
  output: {
    // 与构建产物有关的选项
    polyfill: 'usage',
    dataUriLimit: {
      image: 5000,
      media: 0,
    },
    externals: {
      ReactDom: 'react-dom',
      React: 'react',
      moment: 'moment',
      dayjs: 'dayjs',
      lodash: '_',
      qs: 'qs',
    },
  },
  source: {
    // 与源代码解析、编译方式相关的选项
    define: {
      // 定义全局常亮
      VERSION: JSON.stringify('1.0.2'),
    },
    alias: {
      // 配置别名
      '@': path.resolve(__dirname, './src'),
      assets: path.resolve('./src/assets'),
    },
    transformImport: () => {
      return [
        {
          libraryName: 'lodash',
          customName: 'lodash/{{ member }}',
        },
      ]
    },
  },
  server: {
    // 与 Rsbuild 服务器有关的选项 proxy
    // 在本地开发和预览时都会生效
    port: 3001,
    proxy: {
      // '/api': 'http://localhost:3000',
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
      },
    },
  },

  performance: {
    // 与构建性能、运行时性能有关的选项
    chunkSplit: {
      strategy: 'split-by-module',
    },
  },
  moduleFederation: {
    // 与模块联邦有关的选项
    options: {
      name: 'remote',
    },
  },
})
