declare function replacePath(path: any): void;
declare function replaceLib(): {
    visitor: {
        ImportDeclaration: typeof replacePath;
        ExportNamedDeclaration: typeof replacePath;
    };
};
export default replaceLib;
