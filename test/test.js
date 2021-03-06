'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var lesshint = require('../');
var Stream = require('stream');

it('should check less files', function (cb) {
    var stream = lesshint();

    stream.on('error', function (error) {
        if (/spaceBeforeBrace/.test(error) && /spaceAfterPropertyColon/.test(error)) {
            assert(true);

            cb();
        }
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo{\ncolor: red;\n}\n')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture2.less',
        contents: new Buffer('.foo {\ncolor:red;\n}\n')
    }));

    stream.end();
});

it('should allow valid files', function (cb) {
    var stream = lesshint();

    stream.on('data', function () {});

    stream.on('error', function (error) {
        assert(false);
    });

    stream.on('end', cb);

    stream.write(new gutil.File({
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo {\ncolor: red;\n}\n')
    }));

    stream.end();
});

it('should load file specified in configPath', function (cb) {
    var stream = lesshint({
        configPath: './test/config.json'
    });

    stream.on('data', function () {});

    stream.on('error', function (error) {
        assert(false);

        cb();
    });

    stream.on('end', cb);

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo {\ncolor: red;\n}\n')
    }));

    stream.end();
});

it('should ignore null files', function () {
    var stream = lesshint();

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture.less',
        contents: null
    }));

    stream.end();
});

it('should ignore streams', function () {
    var stream = lesshint();

    assert.throws(function () {
        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Stream()
        }));
    }, gutil.PluginError);

    stream.end();
});

it('should ignore excluded files', function () {
    var stream = lesshint({
        configPath: './test/config.json'
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/exclude.less',
        contents: new Buffer('.foo{\ncolor: red;\n}\n')
    }));

    stream.end();
});
