var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    stripDebug = require('gulp-strip-debug'),
    replace = require('gulp-replace')
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    processhtml = require('gulp-processhtml'),
    minifyHTML = require('gulp-minify-html');

gulp.task('styles', function() {
    return gulp.src('assets/css/style.css')
        .pipe(autoprefixer('last 2 version'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('assets/build'));
});

gulp.task('scripts', function() {
    return gulp.src([
            'assets/js/jquery.min.js',
            'assets/js/timbre.js',
            'assets/js/javascript.js'
        ])
        .pipe(concat('javascript.min.js'))
        .pipe(stripDebug())
        .pipe(replace(/window\.GAME/g, 'var GAME'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/build'));
});

gulp.task('clean', function() {
    return gulp.src(['assets/build', 'build.html'], {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts');
    gulp.src('index.html')
        .pipe(processhtml('build.html'))
        .pipe(minifyHTML({empty: true}))
        .pipe(gulp.dest('./'));
});
