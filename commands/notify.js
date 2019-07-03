//@aliases alert

function main(args) {
    
    sh('notify ' + encodeArg(args[0]));
}