"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_1 = require("rollup");
const getRollupConfig_1 = __importDefault(require("./getRollupConfig"));
async function build(entry, opts) {
    const { cwd, type, bundleOpts } = opts;
    const rollupConfigs = (0, getRollupConfig_1.default)({
        cwd,
        type,
        entry,
        bundleOpts,
    });
    for (const rollupConfig of rollupConfigs) {
        const { output, ...input } = rollupConfig;
        const bundle = await (0, rollup_1.rollup)(input);
        await bundle.write(output);
    }
}
async function default_1(opts) {
    if (Array.isArray(opts.entry)) {
        const { entry: entries } = opts;
        for (const entry of entries) {
            await build(entry, opts);
        }
    }
    else {
        await build(opts.entry, opts);
    }
}
exports.default = default_1;
