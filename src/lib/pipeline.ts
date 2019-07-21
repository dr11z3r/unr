import yargs = require('yargs');
import Pipe = require('./pipe');
import fs = require('fs');
import chalk = require('chalk');

export = class Pipeline {
    pipes: Pipe[];
    variables: any;
    rawcmd: string;
    originalrawcmd: string;
    replacePlaceholders(rawcmd: string): string {
        var any = false, escaped = false, isReadingCmd = false, cmdStart = 0;
        for (var i = 0; i < rawcmd.length; i++) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (rawcmd[i] === '\\') escaped = true; else {
                if (isReadingCmd) {
                    if (rawcmd[i] === '}') {
                        var resultOf = (x: any) => new Pipeline(x).execute(null);
                        rawcmd = rawcmd.substr(0, cmdStart) + resultOf(rawcmd.substring(cmdStart + 2, i)) + rawcmd.substr(i + 1);
                        any = true;
                        break;
                    }
                } else if (rawcmd[i] === '#' && rawcmd[i + 1] === '{') {
                    isReadingCmd = true;
                    cmdStart = i;
                }
            }
        }
        if (any) {
            return this.replacePlaceholders(rawcmd);
        }
        return rawcmd;
    }
    connectPipes(pipes: Pipe[]): Pipe[] {
        var any = false;
        for (var i = 0; i < pipes.length; i++) {
            var pipe = pipes[i];
            if (pipe.type === 2 || pipe.type === 3) {
                if (!pipe.input) {
                    if (i + 1 === pipes.length) throw new Error(`Out of bounds: missing input for pipe at ${i} "${pipe.cmd}"`);
                    pipe.input = pipes.splice(i + 1, 1)[0];
                    pipe.input.type = 4;
                    any = true;
                    break;
                }
            }
        }
        if (any) return this.connectPipes(pipes);
        return pipes;
    }
    getPipes(rawcmd: string): Pipe[] {
        var pipes = [];
        var isInsideQuotedArg = false, escaped = false, last = '\x00';
        var current = '';
        for (var i = 0; i < rawcmd.length; i++) {
            var chr = rawcmd[i];
            if (escaped) {
                current += chr;
                escaped = false;
                last = chr;
                continue;
            }
            if (chr === '\\') escaped = true; else {
                if (isInsideQuotedArg) {
                    current += chr;
                    if (chr === '"') {
                        isInsideQuotedArg = false;
                    }
                } else {
                    if (chr === '"') {
                        current += chr;
                        isInsideQuotedArg = true;
                    } else if (last === ' ') {
                        if (chr === '&') {
                            pipes.push(new Pipe(current.trim(), 0));
                            current = '';
                        } else if (chr === '|') {
                            pipes.push(new Pipe(current.trim(), 1));
                            current = '';
                        } else if (chr === '>') {
                            pipes.push(new Pipe(current.trim(), 2));
                            current = '';
                        } else if (chr === '<') {
                            pipes.push(new Pipe(current.trim(), 3));
                            current = '';
                        } else current += chr;
                    } else current += chr;
                }
            }
            last = chr;
        }
        if (current.trim() !== '') pipes.push(new Pipe(current.trim(), 1));
        pipes = this.connectPipes(pipes);
        return pipes;
    }
    execute(ctx?: any) {
        if (!ctx) ctx = {};
        if (!global.unr || !global.unr.commands) throw new Error('unr context not found.');
        var unrev = global.unr;
        var result = null, hasError = false, pushResult = true;
        for (var i = 0; i < this.pipes.length; i++) {
            var pipe = this.pipes[i];
            if (pipe.cmd === '') continue;
            if (!pipe.input && result != null) {
                pipe.args.push(
                    result
                );
            }
            if (!unrev.commands[pipe.args[0]]) {
                hasError = true;
                var globalFunc = (global as any)[pipe.args[0]];
                if (globalFunc && typeof globalFunc === 'function') {
                    pipe = new Pipe(`eval ${pipe.args[0]}.apply(unr, ${(global as any).encodeArg(JSON.stringify(pipe.args.slice(1).map(arg => arg)))})`, 1);
                } else {
                    console.log(chalk.red('Command not found: %s'), pipe.args[0]);
                    break;
                }
            }
            if (pipe.input && pipe.input.type === 4 && pipe.type === 3) {
                pipe.args.push(
                    (function unrev_io_redirectfileasinput() {
                        return unr.inputFromFile(pipe.input, result);
                    })()
                );
            }
            var kresult = unrev.runPipe(pipe);
            switch (pipe.type) {
                case 0: result = null; break;
                case 1: 
                    result = kresult;
                break;
                case 2:
                    result = null;
                    if (!pipe.input) {
                        throw new Error('Missing output file.');
                    }
                    unrev.outputToFile(pipe.input, result);
                    break;
                case 3:
                    result = null;
                    break;
            }
        }
        return result;
    }
    constructor(rawcmd: string) {
        this.variables = [];
        this.originalrawcmd = rawcmd;
        rawcmd = this.replacePlaceholders(rawcmd);
        this.rawcmd = rawcmd;
        this.pipes = this.getPipes(rawcmd);
    }
}