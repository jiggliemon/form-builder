var gulp = require('gulp');
var mocha = require('gulp-mocha');

var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

function compile(watch) {
  var bundler = watchify(browserify(['node_modules/babelify/node_modules/babel-core/polyfill','node_modules/whatwg-fetch', './src/index.js'], { debug: true })
    .transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('wufoo-jssdk.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });

  }

  rebundle();
}


gulp.task('mocha', function() {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            require: ['babelify/node_modules/babel-core/register']
        }));
});



function watch() {
  gulp.watch(['src/**', 'test/**'], ['mocha']);
  return compile(true);
};

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);