import Pipe = require('./pipe');
import chalk = require('chalk');

export = function(pipe: Pipe) {
    try {
        var result = unr.commands[pipe.args[0]].apply(unr, [pipe.args.slice(1), pipe.cmd, pipe]);
        return result;
    } catch (e) {
        console.log(chalk.red(`[${pipe.args[0]}] ${e.stack}`));
    }
}