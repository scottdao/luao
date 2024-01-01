import fs from 'fs';
import path from 'path';
export default async function () {
    const userConfigName = 'luao.rollup-config.js';
    const userConfigPath = path.resolve(userConfigName);
    if (fs.existsSync(userConfigPath)) {
        const userConfigFn = await import(userConfigPath);
        // TODO 校验扩展项是否配置正确
        if (typeof userConfigFn === 'object') {
            return userConfigFn.default;
        }
    }
    return {};
}
