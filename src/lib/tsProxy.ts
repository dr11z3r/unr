import fs = require('fs');
import ts = require('typescript');
import sha1 = require('sha1');
import path = require('path');

export = function (file: string) {
    var fileContents = fs.readFileSync(file, { encoding: 'utf8' });
    var cacheFile = `${unr.path}/data/cache/ts${sha1(file)}`;
    var cacheFileContents = `${unr.path}/data/cache/commands/${path.basename(file)}`;
    var hash = sha1(fileContents);
    if (fs.existsSync(cacheFile)) {
        if (hash === fs.readFileSync(cacheFile, { encoding: 'utf8' })) {
            return cacheFileContents;
        }
    }
    fs.writeFileSync(cacheFile, hash);
    fs.writeFileSync(cacheFileContents, ts.transpile(fileContents));
    return cacheFileContents;
}