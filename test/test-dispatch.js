var dispatch = require('../lib/dispatch');

exports['simple match'] = function(test){
    test.expect(3);
    var request = {url: '/test', method: 'GET'};
    dispatch({
        '/test': function(req, res, next){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
            test.done();
        }
    })(request, 'response', 'next');
};

exports['no match'] = function(test){
    var request = {url: '/abc', method: 'XYZ'};
    dispatch({
        '/test': function(req, res, next){
            test.ok(false, 'should not be called');
        }
    })(request, 'response', function(){
        test.ok(true, 'next should be called when no matches');
        test.done();
    });
};

exports['regexp match'] = function(test){
    var request = {url: '/abc/test123'};
    dispatch({
        '/(\\w+)/test\\d*': function(req, res, next, group){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
            test.equals(group, 'abc');
            test.done();
        }
    })(request, 'response', 'next');
};

exports['multiple matches'] = function(test){
    test.expect(4);
    var request = {url: '/abc', method: 'POST'};
    dispatch({
        '/(\\w+)/?': function(req, res, next, group){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
            test.equals(group, 'abc');
        },
        '/(\\w+)': function(req, res, next, group){
            test.ok(false, 'only first match should be called');
        }
    })(request, 'response', 'next');
    setTimeout(test.done, 10);
};

exports['nested urls'] = function(test){
    var request = {url: '/folder/some/other/path', method: 'GET'};
    dispatch({
        '/folder': {
            '/some/other': {
                '/path': function(req, res, next){
                    test.equals(req, request);
                    test.equals(res, 'response');
                    test.equals(next, 'next');
                    test.done();
                }
            }
        }
    })(request, 'response', 'next');
};

exports['nested urls with captured groups'] = function(test){
    var request = {url: '/one/two/three', method: 'GET'};
    dispatch({
        '/(\\w+)': {
            '/(\\w+)': {
                '/(\\w+)': function(req, res, next, group1, group2, group3){
                    test.equals(req, request);
                    test.equals(res, 'response');
                    test.equals(next, 'next');
                    test.equals(group1, 'one');
                    test.equals(group2, 'two');
                    test.equals(group3, 'three');
                    test.done();
                }
            }
        },
        '/one/two/three': function(req, res, next){
            test.ok(false, 'should not be called, previous key matches');
            test.done();
        }
    })(request, 'response', 'next');
};

exports['method'] = function (test) {
    test.expect(5);
    var call_order = [];
    var request = {url: '/test', method: 'GET'};
    var handle_req = dispatch({
        'GET /test': function(req, res, next){
            call_order.push('GET');
            test.equals(req, request);
            test.equals(res, 'response');
        },
        'POST /test': function(req, res, next){
            call_order.push('POST');
            test.equals(req, request);
            test.equals(res, 'response');
        }
    });
    handle_req(request, 'response', 'next');
    request.method = 'POST';
    handle_req(request, 'response', 'next');
    request.method = 'DELETE';
    handle_req(request, 'response', function(){
        test.same(call_order, ['GET', 'POST']);
        test.done();
    });
};

exports['nested method'] = function (test) {
    test.expect(2);
    var call_order = [];
    var request = {url: '/path/test', method: 'GET'};
    var handle_req = dispatch({
        '/path': {
            'GET /test': function(req, res, next){
                test.equals(req, request);
                test.equals(res, 'response');
            }
        }
    });
    handle_req(request, 'response', function(){
        test.ok(false, 'should not be called');
    });
    request.method = 'POST';
    handle_req(request, 'response', function(){
        test.done();
    });
};

exports['nested already defined method'] = function (test) {
    test.expect(2);
    var call_order = [];
    var request = {url: '/path/create/item', method: 'POST'};
    var handle_req = dispatch({
        '/path': {
            'POST /create': {
                '/item': function(req, res, next){
                    test.equals(req, request);
                    test.equals(res, 'response');
                }
            }
        }
    });
    handle_req(request, 'response', function(){
        test.ok(false, 'should not be called');
    });
    request.method = 'GET';
    handle_req(request, 'response', function(){
        test.done();
    });
};

exports['nested redefine previous method'] = function (test) {
    test.expect(2);
    var call_order = [];
    var request = {url: '/path/create/item', method: 'GET'};
    var handle_req = dispatch({
        '/path': {
            'POST /create': {
                'GET /item': function(req, res, next){
                    test.equals(req, request);
                    test.equals(res, 'response');
                }
            }
        }
    });
    handle_req(request, 'response', function(){
        test.ok(false, 'should not be called');
    });
    request.method = 'POST';
    handle_req(request, 'response', function(){
        test.done();
    });
};

exports['whitespace between method and pattern'] = function (test) {
    test.expect(6);
    var call_order = [];
    var request = {url: '/test', method: 'GET'};
    var handle_req = dispatch({
        'GET    /test': function(req, res, next){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
        },
        'POST\t/test': function(req, res, next){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
        }
    });
    handle_req(request, 'response', 'next');
    request.method = 'POST';
    handle_req(request, 'response', 'next');
    test.done();
};

exports['named param'] = function (test) {
    var request = {url: '/abc/test123'};
    dispatch({
        '/:name/test\\d{3}': function(req, res, next, name){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
            test.equals(name, 'abc');
            test.done();
        }
    })(request, 'response', 'next');
};

exports['nested named param'] = function (test) {
    var request = {url: '/test/123'};
    dispatch({
        '/test': {
            '/:param': function(req, res, next, name){
                test.equals(req, request);
                test.equals(res, 'response');
                test.equals(next, 'next');
                test.equals(name, '123');
                test.done();
            }
        }
    })(request, 'response', 'next');
};

exports['method as final object'] = function (test) {
    var request = {url: '/test/etc', method: 'POST'};
    dispatch({
        '/test': {
            GET: function(req, res, next){
                test.ok(false, 'GET should not be called');
            },
            '/etc': {
                GET: function(req, res, next){
                    test.ok(false, 'GET should not be called');
                },
                POST: function(req, res, next){
                    test.equals(req, request);
                    test.equals(res, 'response');
                    test.equals(next, 'next');
                    test.done();
                },
            }
        }
    })(request, 'response', 'next');
};

exports['without next function - eg, vanilla http servers'] = function (test) {
    var request = {url: '/test/123'};
    dispatch({
        '/test': {
            '/:param': function(req, res, name){
                test.equals(req, request);
                test.equals(res, 'response');
                test.equals(name, '123');
                test.done();
            }
        }
    })(request, 'response');
};
