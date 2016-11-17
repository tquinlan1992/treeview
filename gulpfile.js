const gulp = require('gulp');

gulp.task('test', require("./gulp/tasks/test"));

gulp.task('jshint', require("./gulp/tasks/jshint"));

gulp.task('browserify-treeview', require("./gulp/tasks/browserify-treeview"));

gulp.task('browserify-sample', require("./gulp/tasks/browserify-sample"));

gulp.task("copy-sample", require("./gulp/tasks/copy-sample"));

gulp.task('watch', function() {
    gulp.watch('./src/app/**', ['browserify-sample']);
    gulp.watch('./src/sample/**/*.html', ['copy-sample']);
    gulp.watch('./src/sample/server.js', ['copy-sample']);
    gulp.watch('./src/sample/**/*.js', ['browserify-sample']);
});

gulp.task('default', ['test']);
