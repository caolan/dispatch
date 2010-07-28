# Dispatch

A really simple URL dispatcher for
[Connect](http://github.com/senchalabs/connect). Allows arbitrarily nested
regular expressions for matching URLs and calling an associated function.

    var Connect = require('connect'),
        dispatch = require('dispatch');

    Connect.createServer(
        dispatch({
            '/about': function(req, res){
                ...
            },
            '/user': function(req, res){
                ...
            },
            '/user/posts': function(req, res){
                ...
            },
            '/user/posts/(\\w+)': function(req, res, post){
                ...
            }
        })
    );

Dispatch can be used with a straight-forward object literal containing view
functions keyed by URL. As you can see from the last URL in the list, captured
groups are passed to the matching function as an argument.

So far so predictable. However, it is also possible to nest these objects as
you see fit:

    Connect.createServer(
        dispatch({
            '/about': function(req, res){ ...  },
            '/user': {
                '/': function(req, res){ ...  },
                '/posts': function(req, res){ ...  },
                '/posts/(\\w+)': function(req, res, post){ ...  }
            }
        })
    );

This helps you tidy up the structure to make it more readable. It also makes
renaming higher-level parts of the path much simpler. If we wanted to change
'user' to 'member', we'd now only have to do that once. Another advantage of
being able to nest groups of URLs is mounting reusable apps in your site tree.
Let's assume that 'user' is actually provided by another module:

    Connect.createServer(
        dispatch({
            '/about': function(req, res){ ...  },
            '/user': require('./user').urls
        })
    );

Easy! A really lightweight and flexible URL dispatcher that just does the
obvious. And when I say lightweight, it currently clocks in at about 26 lines
of actual JavaScript ;)

A couple of implementation points:

1. The regular expressions automatically have '^' and '$' added to the pattern
   at the start and end or the URL.
2. Only the first match is called, subsequent matches for a URL will not be
   called.
3. If there are no matches, the request is passed to the next handler in the
   Connect middleware chain.

I like to combine this with [quip](http://github.com/caolan/quip) for rapid
prototyping and just getting my ideas down in code:

    var Connect = require('connect'),
        quip = require('quip'),
        dispatch = require('dispatch');

    var server = Connect.createServer(
        quip.filter(),
        dispatch({
            '/': function(req, res){
                res.text('hello world!');
            },
            '/api': function(req, res){
                res.json({hello: 'world'});
            }
        })
    );

    server.listen(8080);

Have fun!
