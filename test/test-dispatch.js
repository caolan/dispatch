var dispatch = require('dispatch');

exports['simple match'] = function(test){
    test.expect(3);
    var request = {url: '/test'};
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
    var request = {url: '/abc'};
    dispatch({
        '/test': function(req, res){
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
    var request = {url: '/abc'};
    dispatch({
        '/(\\w+)/?': function(req, res, next, group){
            test.equals(req, request);
            test.equals(res, 'response');
            test.equals(next, 'next');
            test.equals(group, 'abc');
        },
        '/(\\w+)': function(req, res, group){
            test.ok(false, 'only first match should be called');
        }
    })(request, 'response', 'next');
    setTimeout(test.done, 10);
};

exports['nested urls'] = function(test){
    var request = {url: '/folder/some/other/path'};
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
    var request = {url: '/one/two/three'};
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
        '/one/two/three': function(req, res){
            test.ok(false, 'should not be called, previous key matches');
            test.done();
        }
    })(request, 'response', 'next');
};

exports['passed condition'] = function(test){
    test.expect(1);
    var request = {url: '/test', name:'pass'};
    dispatch({
        '/test': function(req, res, next){
            test.ok(true);
            test.done();
        }
    }, function(req){return req.name == 'pass';})(request, 'response', 'next');
};

exports['failed condition'] = function(test){
    test.expect(0);
    var request = {url: '/test', name:'fail'};
    dispatch({
        '/test': function(req, res, next){
            test.ok(true);
            test.done();
        }
    }, function(req){return req.name == 'pass';})(request, 'response', function(){test.done()});
};
