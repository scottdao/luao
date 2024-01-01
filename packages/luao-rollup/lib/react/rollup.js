import { rollup } from 'rollup';
import getRollupConfig from './getRollupConfig.js';
async function build(entry, opts) {
    const { cwd, type, bundleOpts } = opts;
    const rollupConfigs = await getRollupConfig({
        cwd,
        type,
        entry,
        bundleOpts,
    });
    for (const rollupConfig of rollupConfigs) {
        const { output, ...input } = rollupConfig;
        const bundle = await rollup(input);
        await bundle.write(output);
    }
}
export default async function (opts) {
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
