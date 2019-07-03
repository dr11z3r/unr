import fs = require('fs');
import Pipe = require('./lib/pipe');
import Pipeline = require('./lib/pipeline');
import parseArgs = require('./lib/parseArgs');
import chalk = require('chalk');
import readline = require('readline');
import runPipe = require('./lib/runPipe');
import loadCommand = require('./lib/loadCommand');
import tsProxy = require('./lib/tsProxy');
import mpath = require('path');

const basepath = mpath.resolve(__dirname.indexOf('build/src') !== -1 ? __dirname+'../../..' : __dirname);

var unr = global.unr = {
    path: basepath,
    cwd: process.cwd(),
    info: 'unr 1.0',
    commands: {},
    runPipe: runPipe,
    outputToFile: (pipe: Pipe) => console.log('Not Implemented: outputToFile(%s)', pipe.cmd),
    inputFromFile: (pipe: Pipe) => console.log('Not Implemented: inputFromFile(%s)', pipe.cmd),
    parseArgs: parseArgs,
    paths: [basepath],
} as Iunr;

function prompt(rl: any) {
    rl.setPrompt(`${unr.cwd}> `);
    rl.prompt();
}
function entrypoint() {
    console.log('unr 2.0 - Copyright (C) 2019 by berserker');
    console.log('Loading commands...');
    var dir = fs.readdirSync(`${unr.path}/commands`);
    process.stdout.write('Loading: ');
    for (let item of dir) {
        if (item.endsWith('.js')) {
            process.stdout.write(item + ' ');
            loadCommand(`${unr.path}/commands/${item}`);
        } else if(item.endsWith('.ts')) {
            process.stdout.write(item + ' ');
            loadCommand(tsProxy(`${unr.path}/commands/${item}`));
        }
    }
    console.log('\nOK.');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', (cmd) => {
        if (cmd === '') {
            prompt(rl);
            return;
        }
        var _quit = false;
        switch (cmd) {
            case 'exit': case 'quit': case 'die': _quit = true; break;
            default:
                try {
                    var pipeline = new Pipeline(cmd);
                    var result = pipeline.execute();
                    if (result != null) console.log(result);
                } catch (e) {
                    console.log(chalk.red(`[${cmd}] -> ${e.stack}`));
                }
                break;
        }
        if (_quit) {
            rl.close();
            process.exit(0);
        } else {
            prompt(rl);
        }
    });
    prompt(rl);
}

if (process.argv.length < 3) entrypoint();