//@aliases alert

function main(args) {
    if(process.platform === 'linux') {
        sh('notify-send --urgency=low ' + encodeArg(args[0]));
    }
}