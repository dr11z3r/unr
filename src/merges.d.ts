interface Iunr {
    path: string;
    cwd: string;
    info: string;
    commands: { [cmd: string]: Function };
    runPipe: any;
    outputToFile: any;
    inputFromFile: any;
    parseArgs: any;
    paths: string[];
}

declare var unr: Iunr;
declare var main: any;

declare module NodeJS {
    interface Global {
        unr: Iunr
    }
}
declare module 'chalk';
declare module 'sha1';