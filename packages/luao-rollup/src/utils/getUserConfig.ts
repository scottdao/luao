import fs from 'fs';
import path from 'path';
import { IBundleOptions } from '../types';

export default function (): Array<IBundleOptions> | IBundleOptions {
  const userConfigName = 'luao.rollup-config.js';
  const userConfigPath = path.resolve(userConfigName);

  if (fs.existsSync(userConfigPath)) {
    const userConfigFn = require(userConfigPath);
    // TODO 校验扩展项是否配置正确
    if (typeof userConfigFn === 'object') {
      return userConfigFn;
    }
  }
  return {};
}
