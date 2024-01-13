import { createRequire } from 'module'

export const Require = (filePath: string) => { 
    const requireFile = createRequire(import.meta.url)
    return requireFile(filePath);
}
