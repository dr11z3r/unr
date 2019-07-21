var fs = require('fs');

function main(args, rawArgs, pipe) {
    if(!args.length) return 'Usage: command [create | exists | info] name';
    switch (args[0]) {
        default: console.log('Unknown command: %s', args[0]); break;
        case 'create':
            if (!args[1]) console.log('Missing operand.'); else {
                var commandPath = `${unr.path}/local/commands/${args[1]}.js`;
                fs.writeFileSync(commandPath, `function main() {\r\n\t\r\n}`);
                if (process.platform === 'linux') {
                    sh('gedit ' + encodeArg(commandPath));
                } else {
                    sh('notepad ' + encodeArg(commandPath));
                }
            }
            break;
        case 'exists':
                return unr.commands[args[1]] != null;
        case 'info':
                if (unr.commands[args[1]] != null) {
                    return {};
                } else return null;
                break;
        
    }
}