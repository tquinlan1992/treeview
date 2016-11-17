const gulp = require('gulp');
const tape = require('gulp-tape');
const tapColorize = require('tap-colorize');

module.exports = function() {
    return gulp.src('test/**/Test*.js')
        .pipe(tape({
            reporter: tapColorize()
        }));
};
