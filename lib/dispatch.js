var url = require('url');

/*
 * Accepts a nested set of object literals and creates a single-level object
 * by combining the keys.
 *
 * flattenKeys({'a': {'b': function(){}, 'c': function(){}}})
 * {'ab': function(){}, 'ac': function(){}}
 *
 */
function flattenKeys(obj, /*optional*/acc, /*optional*/prefix){
    acc = acc || {};
    prefix = prefix || '';
    Object.keys(obj).forEach(function(k){
        (typeof obj[k] == 'function') ?
            acc[prefix + k] = obj[k]:
            flattenKeys(obj[k], acc, prefix + k);
    });
    return acc;
}

/*
 * Compiles the keys of an object to a reqular expression, returning an array
 * of arrays.
 *
 * compileKeys({'abc': function(){}, 'xyz': function(){}})
 * [[/^abc$/, function(){}], [/^xyz$/, function(){}]]
 */
function compileKeys(urls){
    return Object.keys(urls).map(function(k){
        return [new RegExp('^' + k + '$'), urls[k]];
    });
};

/*
 * The exported function for use as a Connect provider.
 * See test/test-dispatch.js for example usage.
 */
module.exports = function(urls){
    var compiled = compileKeys(flattenKeys(urls));
    return function(req, res, next){
        if(!compiled.some(function(x){
            var match = x[0].exec(url.parse(req.url).pathname);
            if(match) x[1].apply(null, [req, res].concat(match.slice(1)));
            return match;
        })) next();
    };
};
