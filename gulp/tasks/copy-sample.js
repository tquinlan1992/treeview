const gulp = require('gulp');

module.exports = function() {
    gulp.src("./src/sample/sample.html", {
            base: "./src/sample"
        })
        .pipe(gulp.dest("build/sample/public", {}));
    gulp.src([
            "./node_modules/angular-material/angular-material.min.css",
            "./node_modules/font-awesome/css/font-awesome.min.css"
        ])
        .pipe(gulp.dest("build/sample/public/css", {}));
    gulp.src("./node_modules/font-awesome/fonts/*")
        .pipe(gulp.dest("build/sample/public/fonts", {}));
    gulp.src("./src/sample/server.js")
        .pipe(gulp.dest("build/sample", {}));
};
