import fs from 'fs';
import path from 'path';
import { IBundleOptions } from '../types';
import os from 'os'

export default async function (): Promise<Array<IBundleOptions> | IBundleOptions>  {
  const userConfigName = 'luao.rollup-config.js';
  const userConfigPath = path.resolve(userConfigName);

  if (fs.existsSync(userConfigPath)) {
    let platform = os.platform()
    const userConfigFn = await import(platform === 'win32'?`file://${userConfigPath}`:userConfigPath);
    // TODO 校验扩展项是否配置正确
    if (typeof userConfigFn === 'object') {
      return userConfigFn.default;
    }
  }
  return {};
}
