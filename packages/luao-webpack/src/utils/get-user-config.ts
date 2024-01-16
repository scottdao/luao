import fs from 'fs';
import path from 'path';
import Config from 'webpack-5-chain';
import { Mode } from '../type';
import util from 'luao-util'

export async  function getUserConfig() {
  const userConfigName = 'luao.webpack-config.js';
  const userConfigPath = path.resolve(userConfigName);

  if (fs.existsSync(userConfigPath)) {
    // const userConfigFn = util.Require(userConfigPath);
    const userConfigFn = await import(userConfigPath);
    // TODO 校验扩展项是否配置正确
    if (typeof userConfigFn === 'object') {
      return userConfigFn.default;
    }
    // if (typeof userConfigFn === 'function') {
    //   // userConfigFn({
    //   //   config,
    //   //   script: mode,
    //   // });
    // } else {
    //   console.log(`${userConfigName} config error`);
    //   process.exit(1);
    // }
  }
  return {}
}
