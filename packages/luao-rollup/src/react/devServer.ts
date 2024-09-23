import { sync } from 'cross-spawn';
import { join } from 'path'
import signale from 'signale';
const handleDevServer = async (watchOption: any, filename: string) => {
    // console.log(watchOption.devServer, 'option')
    const filePathName = join(process.cwd(), `${filename}/index.js`);
    // 默认采用node执行js文件；
    const spawn = sync('node', [filePathName], {
        env: process.env,
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
    });
    if (spawn.status !== 0) {
        signale.error(`-w, --w:命令执行失败`);
        process.exit(1);
    }
 }

export { handleDevServer }