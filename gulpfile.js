'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    webserver = require('gulp-webserver');

gulp.task('default', ['compileSass', 'compileJavascript', 'moveHTML', 'webserver', 'watch']);

gulp.task('compileSass', function () {
  gulp.src('./src/scss/style.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({ browsers: ['> 5%'] }))
  .pipe(gulp.dest('./dist/css/'));

  return gutil.log('Compiled Sass');
});

gulp.task('compileJavascript', function() {
  gulp.src('./src/js/*')
  .pipe(gulp.dest('./dist/js/'));
});

gulp.task('moveHTML', function() {
  gulp.src('./src/*.html')
  .pipe(gulp.dest('./dist/'));
});

gulp.task('webserver', function () {
  gulp.src('./dist')
  .pipe(webserver({
    fallback: 'index.html',
    livereload: true,
    open: true,
  }));
});

gulp.task('watch', function () {
  gulp.watch('./src/scss/**/*.scss', ['compileSass']);
  gulp.watch('./src/js/**/*.js', ['compileJavascript']);
  gulp.watch('./src/*.html', ['moveHTML']);
});
