import { Configuration } from 'webpack';

export enum Mode {
  dev = 'dev',
  build = 'build',
  mock = 'mock',
  analyze = 'analyze',
  devMLib = 'devMLib',
}

export enum Env {
  development = 'development',
  production = 'production',
}

export enum Transpiler {
  babel = 'babel',
  esbuild = 'esbuild',
  none = 'none',
}

export enum JSMinifier {
  terser = 'terser',
  swc = 'swc',
  esbuild = 'esbuild',
  uglifyJs = 'uglifyJs',
  none = 'none',
}

export enum CSSMinifier {
  esbuild = 'esbuild',
  cssnano = 'cssnano',
  none = 'none',
}

export type WebpackConfig = Required<Configuration>;
