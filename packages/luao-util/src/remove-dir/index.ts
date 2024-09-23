import { rimraf } from 'rimraf';
import signale from 'signale';
import fs from 'fs';
import { join } from 'path'
interface RemoveFileProps { 
    files: string[];
    ignore?: string[];
    deep?: boolean;
}
export const removeDir = async ({ files, ignore, deep }: RemoveFileProps) => {
    const cwd = process.cwd()
    const dirs = fs.readdirSync(cwd)
    if (deep !== true) {
        const exitsDirs = dirs.filter(item => files.some(i => i === item))
        if (!exitsDirs || !(exitsDirs && exitsDirs.length)) return signale.warn('dirs over complete!');
        const needRemoveDirs =  exitsDirs.map(
            (path) =>rimraf(join(cwd, path)).then(() => { 
                  return Promise.resolve('done')
                }).catch(err=>Promise.reject(err))
        )
        return Promise.all(needRemoveDirs).then(() => {
                    signale.success('clear file dir success!');
                })
                .catch((err) => {
                    signale.error(err);
                    process.exit(1);
                })
    }
    if (!ignore || !(ignore && ignore.length)) {
        signale.error('deep clear dirs, need to set fileds ignore!');
        return process.exit(1);
    }
    let stack = [...dirs]
    let promises = []
    const pathTable = new Map()
    while (stack.length) {
        const dirName = stack.pop()

        if (ignore.some(item => item === dirName)) {
            continue;
        }
        // 文件还是目录
        if (/(\.(.+)$)/g.test(dirName as string)) {
            continue
        }
        pathTable.set(dirName, join(cwd, dirName as string))
        const dirPath = pathTable.get(dirName)
        if (files.some(i => new RegExp(i, 'g').test(dirName as string))) {
            const dirstats = fs.statSync(dirPath)
            if (dirstats.isDirectory()) {
                promises.push(new Promise(resolve=>resolve(rimraf(dirPath).then(() => { 
                    return Promise.resolve('done')
                }).catch(err => {
                  return Promise.reject(err)
                }))))
            }
        } else {
            const dirs = fs.readdirSync(dirPath)
            stack.push(...(dirs.map(item=>`${dirName}/${item}`)));
        }
    }
   return Promise.all(promises).then(() => {
            signale.success('clear file dir success!');
            return Promise.resolve('done')
        })
        .catch((err) => {
            signale.error(err);
            process.exit(1);
        })
 }