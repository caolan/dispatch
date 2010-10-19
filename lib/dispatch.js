var url = require('url');

/*
 * Accepts a nested set of object literals and creates a single-level object
 * by combining the keys.
 *
 * flattenKeys({'a': {'b': function(){}, 'c': function(){}}})
 * {'ab': function(){}, 'ac': function(){}}
 *
 */
function flattenKeys(obj, /*optional args: */acc, prefix, prev_method){
    acc = acc || [];
    prefix = prefix || '';
    Object.keys(obj).forEach(function(k){
        var split = splitURL(k);
        if(typeof obj[k] == 'function') {
            acc.push([prefix + split.url, split.method || prev_method, obj[k]])
        }
        else {
            flattenKeys(obj[k], acc, prefix + split.url, split.method);
        }
    });
    return acc;
}

/*
 * Compiles the url patterns to a reqular expression, returning an array
 * of arrays.
 *
 * compileKeys([['abc', 'GET', function(){}], ['xyz', 'POST', function(){}]])
 * [[/^abc$/, 'GET', function(){}], [/^xyz$/, 'POST', function(){}]]
 */
function compileKeys(urls){
    return urls.map(function(url){
        url[0] = new RegExp('^' + url[0] + '$');
        return url;
    });
}

/*
 * Break apart a url into the path matching regular expression and the
 * optional method prefix.
 */
function splitURL(url) {
    var method, path, match = /^([A-Z]+)\s+/.exec(url);
    if (match) {
        method = match[1];
        url = /^[A-Z]+\s+(.*)$/.exec(url)[1];
    }
    return {url: url, method: method};
}

/*
 * The exported function for use as a Connect provider.
 * See test/test-dispatch.js for example usage.
 */
module.exports = function(urls){
    var compiled = compileKeys(flattenKeys(urls));
    return function(req, res, next){
        if(!compiled.some(function(x){
            var match = x[0].exec(url.parse(req.url).pathname);
            if (match) {
                if (!x[1] || x[1] === req.method) {
                    x[2].apply(null, [req, res].concat(match.slice(1)));
                    return true;
                }
            }
            return false;
        })) next();
    };
};
