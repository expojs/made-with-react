var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var del = require('del');
var fs = require('fs');
var htmlReplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var uncss = require('gulp-uncss');

var paths = {
  scripts: [
    'assets/js/vendor/*.js',
    'assets/js/src/*.js'
  ],
  styles: [
    'assets/scss/main.scss'
  ]
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build']);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('assets/js'));
});

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(uncss(
      {
        html: [
          '*.html',
          '*.hbs',
          'partials/*.hbs'
        ],
        ignore: [
            ".content-preview",
            ".content-preview p:nth-of-type(2)",
            ".content-preview p:nth-of-type(3)",
            ".content-preview p:nth-of-type(4)",
            ".content-preview p:nth-of-type(5)",
            ".content-preview p:nth-of-type(6)"
        ]
      }
    ))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('replace', ['styles', 'scripts'], function() {
    return gulp.src('layout/default.hbs')
      .pipe(htmlReplace(
        {
          'CSS': '<style>' + fs.readFileSync('./assets/css/main.css', 'utf8') + '</style>',
          'JS': '<script>' + fs.readFileSync('./assets/js/all.min.js', 'utf8') + '</script>'
        },
        {keepBlockTags: true}
      ))
      .pipe(gulp.dest('.'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.styles, ['replace']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'styles', 'replace']);
