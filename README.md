# Dispatch

A really simple URL dispatcher for
[Connect](http://github.com/senchalabs/connect) or a plain Node.js HTTP Server.
Allows arbitrarily nested regular expressions for matching URLs and calling an
associated function.

```js
var Connect = require('connect'),
    dispatch = require('dispatch');

Connect.createServer(
    dispatch({
        '/about': function(req, res, next){
            ...
        },
        '/user/:id': function(req, res, next, id){
            ...
        },
        '/user/posts': function(req, res, next){
            ...
        },
        '/user/posts/(\\w+)': function(req, res, next, post){
            ...
        }
    })
);
```

Or, using a vanilla HTTP Server:

```js
var http = require('http');

var server = http.createServer(
    dispatch({
        '/about': function(req, res){
            ...
        },
        '/user/:id': function(req, res, id){
            ...
        }
    })
);

server.listen(8080);
```

Dispatch can be used with a straight-forward object literal containing view
functions keyed by URL. As you can see from the last URL in the list, captured
groups are passed to the matching function as an argument.

You can also use :named parameters in a URL, which is just a more readable way
of capturing ([^\/]+). Named parameters are passed to the matched function in
the same way as normal regular expression groups.

So far so predictable. However, it is also possible to nest these objects as
you see fit:

```js
Connect.createServer(
    dispatch({
        '/about': function(req, res, next){ ...  },
        '/user': {
            '/': function(req, res, next){ ...  },
            '/posts': function(req, res, next){ ...  },
            '/posts/(\\w+)': function(req, res, next, post){ ...  }
        }
    })
);
```

This helps you tidy up the structure to make it more readable. It also makes
renaming higher-level parts of the path much simpler. If we wanted to change
'user' to 'member', we'd now only have to do that once. Another advantage of
being able to nest groups of URLs is mounting reusable apps in your site tree.
Let's assume that 'user' is actually provided by another module:

```js
Connect.createServer(
    dispatch({
        '/about': function(req, res, next){ ... },
        '/user': require('./user').urls
    })
);
```

Easy! A really lightweight and flexible URL dispatcher that just does the
obvious.

Its also possible to define methods for URLs:

```js
Connect.createServer(
    dispatch({
        '/user': {
            'GET /item': function(req, res, next){ ... },
            'POST /item': function(req, res, next){ ... },
        }
    })
);
```

Just prefix the URL with the http method in uppercase followed by whitespace
and then the path you want to match against. Nested URLs always match the last
method defined in the tree. Because of this, you can use the following style for
matching request methods, if you prefer:

```js
dispatch({
    '/test': {
        GET: function (req, res, next) {
            ...
        },
        POST: function (req, res, next) {
            ...
        }
    }
})
```

A couple of implementation points:

1. The regular expressions automatically have '^' and '$' added to the pattern
   at the start and end or the URL.
2. Only the first match is called, subsequent matches for a URL will not be
   called.
3. If there are no matches, the request is passed to the next handler in the
   Connect middleware chain.

I like to combine this with [quip](http://github.com/caolan/quip) for rapid
prototyping and just getting my ideas down in code:

```js
var Connect = require('connect'),
    quip = require('quip'),
    dispatch = require('dispatch');

var server = Connect.createServer(
    quip(),
    dispatch({
        '/': function(req, res, next){
            res.text('hello world!');
        },
        '/api': function(req, res, next){
            res.json({hello: 'world'});
        }
    })
);

server.listen(8080);
```

Have fun!
