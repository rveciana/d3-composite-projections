var gulp = require('gulp');

gp_concat = require('gulp-concat'),
gp_rename = require('gulp-rename'),
gp_uglify = require('gulp-uglify');
gp_mocha = require('gulp-mocha');
gp_jshint = require('gulp-jshint');


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


gulp.task('default', ['lint','build','test'], function(){});