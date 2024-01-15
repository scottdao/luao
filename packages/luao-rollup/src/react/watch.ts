import { rollup, ModuleFormat, OutputOptions, watch } from 'rollup';
import getRollupConfig from './getRollupConfig';
import { IBundleOptions } from '../types';
import signale from 'signale';
import _ from 'lodash';
import { handleDevServer } from './devServer'
interface OptionProp { 
    cwd: string;
    type: 'umd'
}
interface watchOption { 
    watch?: {
        exclude?: string;
        include?: string;
        devServer?:()=>void
    }
}
const watchBuildConfig = async (entry: string, bundleOpts: IBundleOptions & OptionProp & watchOption) => {
    const { cwd, type } = bundleOpts
    const rollupConfigs = await getRollupConfig({
        cwd,
        type,
        entry:entry,
        bundleOpts: bundleOpts,
        outDir: (bundleOpts.umd !== false && bundleOpts?.umd?.dir)?bundleOpts?.umd?.dir:'dist'
    })
    return rollupConfigs
    // console.log()
}

const watchRollup = async (opts: IBundleOptions[], options: OptionProp) => {
    const { cwd, type } = options
    // console.log('watch', opts)
    const global = signale.scope('luao component watcher');
    const option = opts.map(async (bundleOpt: IBundleOptions&watchOption) => {
        let watchOption = {}
        if (Array.isArray(bundleOpt.entry)) {
            const { entry: entries } = bundleOpt;
            const config = entries.map(async (entry) => await watchBuildConfig(entry, { ...bundleOpt, cwd, type }))
            watchOption = config
            signale.info(config, 'multi --- entry')
            signale.warn('multi-entry function watching not open now')
          } else {
            const config = await watchBuildConfig(bundleOpt.entry!, { ...bundleOpt, cwd, type });
            watchOption = config.map(item => ({...item, watch:bundleOpt.watch}))
        }
        return watchOption
    })
    Promise.all(option).then(options => {
        global.pending('watch start...');
        const watchOpt = _.flattenDeep(options)
        const watcher = watch(watchOpt);
        watcher.on('event', event => {
            switch (event.code) {
                case 'START':
                    global.info('rollup:watcher: rebuilding...');
                    break;
                case 'BUNDLE_START':
                    global.info('rollup:watcher: bundling...');
                    break;
                case 'BUNDLE_END': {
                    global.info('rollup:watcher: Bundled!');
                    if (event.result) {
                        event.result.close()
                    }
                    break;
                }
                case 'END': { 
                    global.success('rollup:watcher: Done!');
                    watchOpt.forEach((wopt: watchOption) => {
                        handleDevServer(wopt.watch, 'dist')
                    })
                    break;
                }
                case 'ERROR':
                    global.error("rollup:watcher:error->> ", event);
            }
        });
        watcher.on('change', (id, { event }) => { 
            global.info(`rollup:watcher: change:::${event}`, id)
         })
        watcher.on('restart', () => {
            global.info('rollup:watcher: restart...')
        })
        watcher.on('close', () => { global.error("rollup:watcher: closed"); })
        process.on('exit', () => {
            // 停止监听
            watcher.close();
        });
    })
}
export default watchRollup