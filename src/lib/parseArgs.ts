function parseArgs(raw: string) {
    var build = '', isInsideString = false, args = [], escapeNext = false;
    for (var i=0;i<raw.length;i++) {
        var chr = raw[i];
        if (escapeNext) {
            escapeNext = false;
            build += chr;
            continue;
        }
        if (chr === '\\') {
            escapeNext = true;
            continue;
        }
        if (chr === '"') {
            if(isInsideString) {
                args.push(build);
                build = '';
                isInsideString = false;
                continue;
            } else {
                if (build !== '') {
                    args.push(build);
                    build = '';
                }
                isInsideString = true;
            }
        } else if(chr === ' ') {
            if(isInsideString) build += chr; else if (build !== '') {
                args.push(build);
                build = '';
            }
        } else {
            build += chr;
        }
    }
    if (build !== '') args.push(build);
    if(isInsideString) throw new Error('unterminated "');
    return args;
}

export = parseArgs;