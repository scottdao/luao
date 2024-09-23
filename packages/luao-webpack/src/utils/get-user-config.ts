import fs from 'fs';
import path from 'path';
// import Config from 'webpack-5-chain';
// import { Mode } from '../type';
import util from 'luao-util';

const defaultConfig = `/** @type {import('webpack').UserConfig} */
      module.exports = {
            externals:{
              react: 'React',
              'react-dom': 'ReactDOM',
              dayjs: 'dayjs',
              'styled-components': 'window["styled-components"]',
            },
          //  extensions:[],
          //  alias:{},
          //  define:{},
          //  entry:[],
          //  plugins:[],
          //  rules:[],
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
`;

export async  function getUserConfig() {
  const userConfigName = 'luao.webpack-config.js';
  const cwd = process.cwd();
  const userConfigPath = path.join(cwd, userConfigName);
  if (!fs.existsSync(userConfigPath)) {
    fs.writeFileSync(userConfigPath, defaultConfig);
  }
  return util.Require(userConfigPath)
}
