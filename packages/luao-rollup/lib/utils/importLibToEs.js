"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const cwd = process.cwd();
function replacePath(path) {
    if (path.node.source && /\/lib\//.test(path.node.source.value)) {
        const esModule = path.node.source.value.replace('/lib/', '/es/');
        const esPath = (0, path_1.dirname)((0, path_1.join)(cwd, `node_modules/${esModule}`));
        if (fs_1.default.existsSync(esPath)) {
            console.log(`[es build] replace ${path.node.source.value} with ${esModule}`);
            path.node.source.value = esModule;
        }
    }
}
function replaceLib() {
    return {
        visitor: {
            ImportDeclaration: replacePath,
            ExportNamedDeclaration: replacePath,
        },
    };
}
exports.default = replaceLib;
