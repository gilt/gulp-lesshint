'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var chalk = require('chalk');
var Lesshint = require('lesshint');
var configLoader = require('lesshint/lib/config-loader');

module.exports = function (options) {
    var lesshint = new Lesshint();
    var out = [];

    options = options || {};

    if (options.configPath) {
        options = configLoader(options.configPath);
    } else {
        // Let lesshint find the options itself (from a .lesshintrc file)
        options = configLoader();
    }

    // override the default instance of gonzales-pe,
    // and insert the gilt fork
    var gonzales = require('gonzales-pe');
    gonzales.gilt = true;
    options.gonzales = gonzales;

    lesshint.configure(options);

    return through.obj(function (file, enc, cb) {
        var contents;
        var errors;

        if (file.isNull()) {
            cb(null, file);

            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-lesshint', 'Streaming not supported'));

            return;
        }

        if (lesshint.isExcluded(file.path)) {
            cb(null, file);

            return;
        }

        try {
            contents = file.contents.toString();
            errors = lesshint.checkString(contents, file.relative);

            file.lesshint = {
                success: true,
                errorCount: 0,
                errors: []
            };

            if (errors.length) {
                file.lesshint.success = false;
                file.lesshint.errorCount = errors.length;
                file.lesshint.errors = errors;
            }

            errors.forEach(function (error) {
                var output = '';

                output += chalk.cyan(error.file) + ': ';

                if (error.line) {
                    output += chalk.magenta('line ' + error.line) + ', ';
                }

                if (error.column) {
                    output += chalk.magenta('col ' + error.column) + ', ';
                }

                output += chalk.green(error.linter) + ': ';
                output += error.message;

                out.push(output);
            });
        } catch (e) {
            out.push(e.stack.replace('null:', file.relative + ':'));
        }

        cb(null, file);
    }, function (cb) {
        if (out.length) {
            this.emit('error', new gutil.PluginError('gulp-lesshint', out.join('\n'), {
                showStack: false
            }));
        }

        cb();
    });
};
