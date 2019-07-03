export = function (raw: string) {
    var s = [], b = null, isInsideString = false;;
    for (var i = 0; i < raw.length; i++) {
        var chr = raw[i];
        if (isInsideString) {
            if (chr === '"') {
                if (b !== null) s.push(b);
                b = null;
                isInsideString = false;
                continue;
            }
            if (b === null) b = '';
            b += chr;
        } else {
            if (chr === '"') {
                if (b !== null) s.push(b);
                b = null;
                isInsideString = true;
            } else {
                if (chr === ' ') {
                    if (b !== null) s.push(b);
                    b = null;
                    continue;
                }
                if (b === null) b = '';
                b += chr;
            }
        }
    }
    if (b !== null) s.push(b);
    return s;
}