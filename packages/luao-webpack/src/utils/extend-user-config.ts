import fs from 'fs';
import path from 'path';
import Config from 'webpack-5-chain';
import { Mode } from '../type';
import util from 'luao-util'

export function extendUserConfig(config: Config, mode: Mode) {
  const userConfigName = 'luao.webpack-config.js';
  const userConfigPath = path.resolve(userConfigName);

  if (fs.existsSync(userConfigPath)) {
    const userConfigFn = util.Require(userConfigPath);
    if (typeof userConfigFn === 'function') {
      userConfigFn({
        config,
        script: mode,
      });
    } else {
      console.log(`${userConfigName} config error`);
      process.exit(1);
    }
  }
}
