import mpath = require('path');
import fs = require('fs');
import parseArgs = require('./parseArgs');
import chalk from 'chalk';

require('./stdlib');

export = function (path: string) {
    let main;
    try {
        var aliases = [mpath.basename(path).replace(/\.(js|ts)$/g, '')];
        var src = fs.readFileSync(path, { encoding: 'utf8' });
        if (src && src.substr(0, 3) === '//@') {
            var lines = src.split('\n');
            for(var ln of lines) {
                if (ln.substr(0, 3) !== '//@') break;
                let dargs = parseArgs(ln);
                switch(dargs[0]) {
                    default:
                        console.log(chalk.red(`Unknown directive: ${dargs[0]}`));
                        break;
                    case '//@aliases': 
                        dargs.slice(1).forEach(narg => aliases.push(narg));
                    break;
                }
            }
        }
        src = `${src};(main)` // hackish
        var rets = eval(src);
        if (!main) main = rets;
    } catch (e) {
        console.log('loaderr!%s -> %s', path, e.stack);
    }
    if (!main) throw new Error(`Missing main function in script ${path}`);
    for (let alias of aliases) {
        unr.commands[alias] = main;
    }
    main = null;
}