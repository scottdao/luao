import { rimraf } from 'rimraf';
import signale from 'signale';
import fs from 'fs';
import { join } from 'path';
interface RemoveFileProps { 
    fileSuffix: string;
    ignore?: string[];
}

export const removeFile = async ({ fileSuffix, ignore }: RemoveFileProps): Promise<any> => {
    if (!fileSuffix) {
        return signale.error('filed fileSuffix can not be empty!')
    }
    if (!ignore || !(ignore && ignore.length)) { 
        ignore = ["node_modules"];
    }
    const rph = process.cwd();
    const dirs = fs.readdirSync(rph)
    let stack: string[] = [...dirs]
    const pathTable = new Map();
    let promises: Promise<any>[] = []
    signale.start('clear file start...');
    while (stack.length) {
        const pathnames = stack.pop();
        if (ignore.some(item => item === pathnames)) { 
            continue;
        }
        pathTable.set(pathnames, join(rph, pathnames as string))
        const filePath = pathTable.get(pathnames)
        //判断是否是文件还是目录
        if (/(\.(.+)$)/g.test(pathnames as string)) {
            if (!new RegExp(`${fileSuffix}$`, 'g').test(pathnames as string)) { 
                continue;
            }
            const htmlFile = `${filePath}`
            // console.log(htmlFile, 'file')
            if (fs.existsSync(htmlFile)) {
                promises.push(new Promise(resolve=>resolve(rimraf(htmlFile).then(res => { 
                    return Promise.resolve('done');
                }).catch(err => {
                    return Promise.reject(err);
                }))))
            }
        } else {
            const dir = fs.readdirSync(filePath)
            stack.push(...(dir.map(item=>`${pathnames}/${item}`)));
        }
    }
   return  Promise.all(promises).then(() => {
        signale.success('clear file dir success!');
        return Promise.resolve('done')
    })
    .catch((err) => {
        signale.error(err);
        process.exit(1);
    })
}