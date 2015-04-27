var gulp = require('gulp');

var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');
var gp_mocha = require('gulp-mocha');
var gp_jshint = require('gulp-jshint');
var gp_replace = require('gulp-replace');


var fs = require('fs');

gulp.task('default', function() {
        

});

gulp.task('test', function(){
    return gulp.src('./test/test.js', {read: false})
        .pipe(gp_mocha({reporter: 'nyan'}));
});

gulp.task('lint', function() {
    return gulp.src('./src/*.js')
        .pipe(gp_jshint())
        .pipe(gp_jshint.reporter('default'));
});

gulp.task('build', function(){
    return gulp.src(['./src/spain-proj.js'])
        .pipe(gp_concat('composite-projections.js'))
        .pipe(gulp.dest('./'))
        .pipe(gp_rename('composite-projections.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./'));
});


gulp.task('license', function() {
  
  var out_file = './LICENSE';

  var d = new Date();
  var year = d.getFullYear(); 
  var create = true;

  try {
     var contents = fs.readFileSync(out_file).toString();
     if (contents.indexOf(year.toString()) > -1) {
       create = false;
     } else {
       create = true;
     }

  } catch (e) {
    create = true;
  }

  if (create == true){
    return gulp.src(['./src/LICENSE'])
        .pipe(gp_replace(/<YEAR>/g, year))
        .pipe(gulp.dest('./'));
  }
  
});

gulp.task('default', ['lint','build','test','license'], function(){});