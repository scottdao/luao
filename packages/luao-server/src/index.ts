import { join, dirname } from 'path'
import { Command } from 'commander'
import fs from 'fs'
import signale from 'signale'
import { sync } from 'cross-spawn';
import url from 'url'

// const currentNodeVersion = process.versions.node;
// const semver = currentNodeVersion.split('.');
// const major = semver[0];

// if (+major < 20) {
//   console.error(
//     `You are running Node ${
//       currentNodeVersion
//     }.\n`
//       + 'Create es module requires Node 20 or higher. \n'
//       + 'Please update your version of Node.',
//   );
//   process.exit(1);
// }

const handleCmdAction = async (name: string, pkg?: any) => {
    const dir = dirname(url.fileURLToPath(import.meta.url))
    const filePathName = join(dir, `/commands/${name}.js`)
    if (!fs.existsSync(filePathName)) {
        signale.error(`${name} command no existing`);
        process.exit(1);
    }
    const argv = process.argv.slice(2);
    const spawn = sync('node', [filePathName, ...argv.slice(1)], {
        env: process.env,
        cwd: dir,
        stdio: 'inherit',
        shell: true,
    });
    if (spawn.status !== 0) {
        signale.error(`${name}命令执行失败`);
        process.exit(1);
    }
}
const program = new Command();
const handleFileOptions = async () => {
    const filePathName = join(`../package.json`)
    const pkg = await import(filePathName, { 'assert': {"type":'json'} })
    program
    .version(pkg.default.version, '-v, --version')
    .argument('<name> [env]', 'running server...')
        .action((name) => {
            handleCmdAction(name, pkg.default)
        }
    ).parse(process.argv)
    return Promise.resolve('done')
}
handleFileOptions()