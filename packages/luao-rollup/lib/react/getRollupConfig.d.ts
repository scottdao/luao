import { ModuleFormat, RollupOptions } from 'rollup';
import { IBundleOptions } from '../types';
interface IGetRollupConfigOpts {
    cwd: string;
    entry: string;
    type: ModuleFormat;
    importLibToEs?: boolean;
    bundleOpts: IBundleOptions;
}
export default function (opts: IGetRollupConfigOpts): Promise<RollupOptions[]>;
export {};
