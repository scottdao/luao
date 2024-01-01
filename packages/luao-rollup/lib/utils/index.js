import { existsSync } from 'fs';
import { join } from 'path';
export function getExistFile(files) {
    for (const file of files) {
        const absFilePath = join(process.cwd(), file);
        if (existsSync(absFilePath)) {
            return file;
        }
    }
}
