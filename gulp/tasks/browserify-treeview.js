const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const babelify = require("babelify");
const stringify = require('stringify');
const es2015 = require("babel-preset-es2015");
const ngAnnotate = require('gulp-ng-annotate');

function TreeviewBrowserifyBundle() {
    return browserify({
            entries: './src/app/app.js',
            debug: true
        })
        .transform(babelify, {
            presets: [es2015]
        })
        .transform(stringify, {
            appliesTo: {
                includeExtensions: [".html", ".css"]
            }
        })
        .bundle();
}

const buildLocation = "./build/dist/";
module.exports = function() {
    TreeviewBrowserifyBundle()
        .pipe(source('treeview.js'))
        .pipe(buffer())
        .pipe(ngAnnotate())
        .pipe(gulp.dest(buildLocation));
    TreeviewBrowserifyBundle()
        .pipe(source('treeview.min.js'))
        .pipe(buffer())
        .pipe(ngAnnotate())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(buildLocation));
    return;
};
