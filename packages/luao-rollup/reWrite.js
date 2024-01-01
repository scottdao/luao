import fs from 'fs'
import path from 'path'
async function reWrite (filePath, fileSuffixName) {
    try {
        const cwd = process.cwd();
        let p = path.join(cwd, filePath)
        if (!fs.existsSync(p)) {
            return console.error('file not exist!')
        }
        let paths = await fs.readdirSync(p)
        const hasDst = item=>(/\.d\.ts/g.test(item))
        let stack = [...paths].filter(item=>!hasDst(item))
        while (stack.length) {
            let top = stack.pop()
            let pat = path.resolve(p, top)
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
    } catch (error) {
        console.log(error)
    }

}

export default reWrite