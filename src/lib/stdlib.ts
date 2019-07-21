import _sha1 = require('sha1');
import _os = require('os');
import fs = require('fs');
import { execSync } from 'child_process';
import parseArgs = require('./parseArgs');

var g: any = global;

g.sha1 = function (input: string) {
    return _sha1(input);
};
g.getInfo = function() {
    return _os.userInfo();
};
g.sh = function(cmd: string) {
    return execSync(cmd).toString();
};
g.encodeArg = function(arg: string) {
    return '"'+arg.replace(/(["`\\])/g,'\\$1')+'"';
};
g.getDefaultProgram = function(kind: string = null) {
    return 'gedit';
};
g.runDefaultProgram = function(kind: string, params: string[]) {
};
g.getHistory = function() {
    return unr.getHistory();
};
g.parseArgs = parseArgs;