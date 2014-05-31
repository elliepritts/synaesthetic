var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    removeLogs = require('gulp-removelogs'),
    replace = require('gulp-replace')
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    processhtml = require('gulp-processhtml');

gulp.task('styles', function() {
    return gulp.src('assets/css/style.css')
        .pipe(autoprefixer('last 2 version'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('assets/build'));
});

gulp.task('scripts', function() {
    return gulp.src('assets/js/*.js')
        .pipe(concat('javascript.min.js'))
        .pipe(removeLogs())
        .pipe(replace(/window\.GAME/g, 'var GAME'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/build'));
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
