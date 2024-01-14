export interface IEsm {
    type: 'rollup';
    file?: string;
    mjs?: boolean;
    minify?: boolean;
    importLibToEs?: boolean;
  }
  
  export interface IUmd {
    name?: string;
    minFile?: boolean;
    file?: string;
    sourcemap?: boolean;
  }
  
  export interface IBundleOptions {
    output?: {
      name?: string;
      /**
       * 输出的文件名称
       */
      file: string;
    };
    extraExternals?: string[];
    esm?: 'rollup' | IEsm | false;
    umd?: IUmd | false;
    removeHtmlFile?: boolean;
    entry?: string;
  }
  export interface IOpts {
    cwd: string;
    watch?: boolean;
    /**
     * 构建时清空outputDir
     * @default true
     * */
    clean?: boolean;
    buildArgs?: IBundleOptions;
    rootConfig?: IBundleOptions;
    rootPath?: string;
  }