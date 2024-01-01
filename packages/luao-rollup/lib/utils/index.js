"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function getExistFile(files) {
    for (const file of files) {
        const absFilePath = (0, path_1.join)(process.cwd(), file);
        if ((0, fs_1.existsSync)(absFilePath)) {
            return file;
        }
    }
}
exports.getExistFile = getExistFile;
