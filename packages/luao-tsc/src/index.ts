import childProcess from 'child_process'
import { rimraf } from 'rimraf';
import path from 'path';
import fs from 'fs'
import signale from 'signale';
// 单个目录重写后缀
async function reWrite (filePath: string, fileSuffixName: string) {
    const global = signale.scope('luao-tsc read dir...');
    try {
        const cwd = process.cwd();
        let p = path.join(cwd, filePath)
        if (!fs.existsSync(p)) {
            return console.error('file not exist!')
        }
        let paths = await fs.readdirSync(p)
        const hasDst = (item: string)=>(/\.d\.ts/g.test(item))
        let stack = [...paths].filter(item => !hasDst(item))
        while (stack.length) {
            let top = stack.pop()
            let pat = path.resolve(p, top as string)
            let stat = await fs.statSync(pat)
            if (stat.isDirectory()) {
                let temp = await fs.readdirSync(pat)
                if (temp) {
                    for (let i of temp) {
                        if (!hasDst(i)) {
                            stack.push(path.join(top, i))
                        }
                    }
                }
            } else {
                let personList = await fs.readFileSync(pat, {encoding: "utf8"})
                var regexpNames = /(export|import)?(\s+?\{\s+?)?.+(\s+?\}\s+?)?(from)?(\s+)?(\'|\")(..\/|.\/)(.+)?(\'|\")/gm
                var match = [...personList.matchAll(regexpNames)];
                let count = 0
                for (let item of match) {
                    if (new RegExp(fileSuffixName, 'g').test(item[1])) {
                        continue
                    }
                    let temp = item[0]
                    let index = item.index + count
                    let now = temp.replace(item[0], `${
                        item[0].slice(0, item[0].length-1)
                    }${fileSuffixName}${item[0].slice(item[0].length-1)}`)
                    let past = personList.slice(0, index)
                    let feature = personList.slice(index + temp.length, personList.length)
                    personList = `${past}${now}${feature}`
                    count = count + 3
                }

                await fs.writeFileSync(pat, personList, {encoding: "utf8"})
            }
        }
        global.success('luao-tsc write file suffix success')
    } catch (error) {
        console.log(error)
        global.success('luao-tsc write file suffix fail')
        process.exit(1);
    }
}
// 执行tsc 命令
async function runSpawnCmd(value: string) {
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
// 清除文件命令
function clearFileCmd(entryFilePath: string[]) { 
    const cwd = process.cwd();
    const global = signale.scope('luao-tsc rewrite start...');
    return Promise.all(entryFilePath.map(item => {
        return new Promise((resolve, reject) => { 
            const filePath = path.join(cwd, item)
            rimraf(filePath).then(() => { 
                console.log('done')
                resolve('done')
                }).catch((err: string) => {
                    console.log(err)
                    reject(err)
                })
        })
    })).then(() => {
        global.success('clear file dir success');
        return Promise.resolve()
    })
    .catch((err) => {
        global.error(err);
        process.exit(1);
        // return Promise.reject(err)
    });
}
// 多个目录重写后缀
async function multipleRewrite(entryFilePath: string[], suffixName: string) {
    await clearFileCmd(entryFilePath)
    const rewriteFn = () => {
        entryFilePath.map(item=>reWrite(item, suffixName))
    }
    runSpawnCmd('tsc').then(() => { 
        rewriteFn()
    })
}
 //获取tsconfig.json配置
async function getConfigTsConfig() {
    const cwd = process.cwd();
    const global = signale.scope('luao-tsc read config...');
    const filePath = path.join(cwd, 'tsconfig.json')
    if (!fs.existsSync(filePath)) {
        global.error('tsconfig.json is not exists!');
        process.exit(1);
    }
     // @ts-ignore
    const fileJson = await import(filePath, {
        assert: { type: 'json' }
    }) 
     const configJson = fileJson.default
     if (!configJson.luaoOutDir || !configJson.luaoOutDir.length) { 
        global.error('tsconfig.json`s props:luaoOutDir must setting!!!');
        process.exit(1)
    }
    if (!configJson.luaoOutFileSuffix) { 
        configJson.luaoOutFileSuffix = '.js';
    }
    const compilerOptions = configJson.compilerOptions
     if (compilerOptions.module === 'commonjs') {
        await clearFileCmd(configJson.luaoOutDir)
        return runSpawnCmd('tsc')
    }
    if (!compilerOptions.module) { 
        const filePath = path.join(cwd, configJson.extends)
         // @ts-ignore
        const fileBaseJson = await import(filePath, {
            assert: { type: 'json' }
        })
        if (fileBaseJson.default.compilerOptions.module === 'commonjs') { 
            await clearFileCmd(configJson.luaoOutDir)
            return runSpawnCmd('tsc')
        }
    }
    global.success('luao-tsc read config success');
    multipleRewrite(configJson.luaoOutDir, configJson.luaoOutFileSuffix)
 }
 getConfigTsConfig()