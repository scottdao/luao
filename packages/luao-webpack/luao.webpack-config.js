/** @type {import('webpack').UserConfig} */
      module.exports = {
            externals:{
              react: 'React',
              'react-dom': 'ReactDOM',
              dayjs: 'dayjs',
              'styled-components': 'window["styled-components"]',
            },
            extensions:[],
            alias:{},
            define:{},
            entry:[],
            plugins:[],
            rules:[],
            publicPath:'/',      // 公共目录
            assetsDir:'static', // 静态资源目录
            outputDir:'dist',   // 静态资源根目录
            devServer:{
              proxy: {
                '/api': {
                    target: "http://xxxx.com",
                    changeOrigin: true,
                    secure: false,
                }
              },
            },
            chain:({ config, script })=>{}
      }
