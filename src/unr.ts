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

const basepath = mpath.resolve(__dirname.indexOf('build/src') !== -1 ? __dirname + '../../..' : __dirname);

var unr = global.unr = {
    path: basepath,
    cwd: process.cwd(),
    info: 'unr 2.0',
    commands: {},
    runPipe: runPipe,
    outputToFile: (pipe: Pipe) => console.log('Not Implemented: outputToFile(%s)', pipe.cmd),
    inputFromFile: (pipe: Pipe) => console.log('Not Implemented: inputFromFile(%s)', pipe.cmd),
    parseArgs: parseArgs,
    paths: [basepath],
    getHistory() {
        unr.updateHistory();
        var histfile = fs.readFileSync('local/historyfile', { encoding: 'utf8' });
        return fs.readFileSync(histfile, { encoding: 'utf8' }).split('\r\n');
    },
    addHistory(command: string) {
        unr.updateHistory();
        var file = fs.readFileSync('local/historyfile', { encoding: 'utf8' });
        try {
            var fp = fs.openSync(file, 'a');
            fs.writeFileSync(fp, `${command}\r\n`);
        } catch (e) {
        } finally {
            fp && fs.closeSync(fp);
        }
    },
    updateHistory() {
        if (!fs.existsSync('local/historyfile')) {
            fs.writeFileSync('local/history.0', '');
            fs.writeFileSync('local/historylen', '1');
            fs.writeFileSync('local/historyfile', 'local/history.0');
        } else {
            var stat = fs.statSync(fs.readFileSync('local/historyfile', { encoding: 'utf8' }));
            if (stat.size > 500000) {
                var len = fs.readFileSync('local/historylen', { encoding: 'utf8' });
                fs.writeFileSync('local/historyfile', `local/history.${len}`);
                fs.writeFileSync('local/historylen', parseInt(len) + 1);
            }
        }
    }
} as Iunr;

function ensureDir(...paths: string[]) {
    for (var path of paths) {
        if(!fs.existsSync(path)) fs.mkdirSync(path);
    }
}
function prompt(rl: any) {
    rl.setPrompt(`${unr.cwd}> `);
    rl.prompt();
}
function loadCommandPath(path: string) {
    var dir = fs.readdirSync(path);
    for (let item of dir) {
        if (item.endsWith('.js')) {
            process.stdout.write(item.replace(/\.js$/, '') + ' ');
            loadCommand(`${path}/${item}`);
        } else if (item.endsWith('.ts')) {
            process.stdout.write(item.replace(/\.ts$/, '') + ' ');
            loadCommand(tsProxy(`${path}${item}`));
        }
    }
}
function entrypoint() {
    console.log('unr 2.0 - Copyright (C) 2019 by berserker');
    ensureDir('local', 'external', 'local/commands', 'external/commands');
    console.log('Loading commands...');
    loadCommandPath(`${unr.path}/commands`);
    loadCommandPath(`${unr.path}/local/commands`);
    loadCommandPath(`${unr.path}/external/commands`);
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

                    unr.addHistory(cmd);

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