import parseArgs = require("./parseArgs");

var yargs = require('yargs');

export = class Pipe {
    input: Pipe;
    cmd: string;
    type: number;
    yargs: any;
    args: string[];
    constructor(cmd: string, type = 0) {
        this.input = null;
        this.cmd = typeof cmd === 'string' ? cmd : '';
        // 0 = don't pipe (&), 1 = pipe (|), 2 = redirect output to file (>), 3 = get input from file (<), 4 = file_ref (@)
        this.type = type;
        this.yargs = yargs.help(false).parse(this.cmd);
        this.args = parseArgs(this.cmd);
    }
}