var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    processhtml = require('gulp-processhtml');

gulp.task('styles', function() {
    return gulp.src('assets/css/style.css')
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('assets/build'))
        .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function() {
    return gulp.src('assets/js/*.js')
        .pipe(concat('javascript.min.js'))
        // .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('assets/build'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('clean', function() {
    return gulp.src(['assets/build'], {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts');
    gulp.src('index.html')
        .pipe(processhtml('index.html'))
        .pipe(gulp.dest('./'));
});
