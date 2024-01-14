import { rollup, ModuleFormat, OutputOptions } from 'rollup';
import getRollupConfig from './getRollupConfig';
import { IBundleOptions } from '../types';

interface IRollupOpts {
  cwd: string;
  entry: string | string[];
  type: ModuleFormat;
  bundleOpts: IBundleOptions;
  importLibToEs?: boolean;
  outDir: string;
}

async function build(entry: string, opts: IRollupOpts) {
  const { cwd, type, bundleOpts, outDir } = opts;
  const rollupConfigs = await getRollupConfig({
    cwd,
    type,
    entry,
    bundleOpts,
    outDir
  });

  for (const rollupConfig of rollupConfigs) {
    const { output, ...input } = rollupConfig;
    const bundle = await rollup(input);
    await bundle.write(output as OutputOptions);
  }
}

export default async function (opts: IRollupOpts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries } = opts;
    for (const entry of entries) {
      await build(entry, opts);
    }
  } else {
    await build(opts.entry, opts);
  }
}
