import fs from 'fs';
export { extendUserConfig } from './extend-user-config'
export function getBrowsersList({ targets }: { targets: Record<string, any> }) {
  return (
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    })
  );
}

export function getEsBuildTarget({
  targets,
}: {
  targets: Record<string, any>;
}) {
  return Object.keys(targets).map((key) => {
    return `${key}${targets[key] === true ? '0' : targets[key]}`;
  });
}

export function getExistFile(files: string[]) {
  for (const file of files) {
    if (fs.existsSync(file)) {
      return file;
    }
  }
  return '';
}

export function getEntryPath(path: string): string | undefined {
  const entry = getExistFile([
    `${path}.tsx`,
    `${path}.ts`,
    `${path}.jsx`,
    `${path}.js`,
    `${path}/index.tsx`,
    `${path}/index.ts`,
    `${path}/index.jsx`,
    `${path}/index.js`,
  ]);
  if (!fs.existsSync(entry)) {
    return undefined;
  }
  return entry;
}
