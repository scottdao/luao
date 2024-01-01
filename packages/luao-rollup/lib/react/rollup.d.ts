import { ModuleFormat } from 'rollup';
import { IBundleOptions } from '../types';
interface IRollupOpts {
    cwd: string;
    entry: string | string[];
    type: ModuleFormat;
    bundleOpts: IBundleOptions;
    importLibToEs?: boolean;
}
export default function (opts: IRollupOpts): Promise<void>;
export {};
