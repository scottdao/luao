import childProcess from 'child_process'
import { rimraf } from 'rimraf';
import path, { resolve } from 'path';
import signale from 'signale';
import reWrite from './reWrite.js';
import fs from 'fs';
// 执行tsc 命令
async function runSpawnCmd(value) {
    return new Promise((resolve, reject) => { 
        const tsc = childProcess.spawn(value)
        tsc.stdout.on('data', (data) => {
            // rewriteFn()
            resolve('data')
            console.log(`stdout: ${data}`);
        });
        tsc.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        tsc.on('close', (code) => {
            reject('close');
            console.log(`child process exited with code ${code}`);
        });
    })
 }
// 多个目录重写后缀
async function multipleRewrite(entryFilePath, suffixName) {
    const cwd = process.cwd();
    const global = signale.scope('luao-tsc rewrite start...');
   await Promise.all(entryFilePath.map(item => {
        return new Promise((resolve, reject) => { 
            const filePath = path.join(cwd, item)
            rimraf(filePath).then(() => { 
                console.log('done')
                resolve('done')
                }).catch((err) => {
                    console.log(err)
                    reject(err)
                })
        })
    })).then(() => {
        global.success('清理输出文件夹');
    })
    .catch((err) => {
        global.error(err);
        process.exit(1);
    });
    const rewriteFn = () => { 
        entryFilePath.map(item=>reWrite(item, suffixName))
    }
    // const outFilePath = 'lib'
    runSpawnCmd('tsc').then(() => { 
        rewriteFn()
    })
}
async function getConfigTsConfig() {
    const cwd = process.cwd();
    const global = signale.scope('luao-tsc read config...');
    const filePath = path.join(cwd, 'tsconfig.json')
    if (!fs.existsSync(filePath)) {
        global.error('tsconfig.json is not exists!');
        process.exit(1);
     }
    const fileJson = await import(filePath, {
        assert: { type: 'json' }
    }) 
    const configJson = fileJson.default
    const compilerOptions = configJson.compilerOptions
    if (compilerOptions.module === 'commonjs') { 
        return runSpawnCmd('tsc')
    }
    if (!compilerOptions.module) { 
        const filePath = path.join(cwd, configJson.extends)
        const fileBaseJson = await import(filePath, {
            assert: { type: 'json' }
        })
        if (fileBaseJson.default.compilerOptions.module === 'commonjs') { 
            return runSpawnCmd('tsc')
        }
    }
    if (!configJson.luaoOutDir || !configJson.luaoOutDir.length) { 
        global.error('tsconfig.json`s props:luaoOutDir must setting!!!');
        process.exit(1)
    }
    if (!configJson.luaoOutFileSuffix) { 
        configJson.luaoOutFileSuffix = '.js';
    }
    global.success('luao-tsc read config success');
    multipleRewrite(configJson.luaoOutDir, configJson.luaoOutFileSuffix)
}
getConfigTsConfig()