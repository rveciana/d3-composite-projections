var gulp = require('gulp');

var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');
var gp_mocha = require('gulp-mocha');
var gp_jshint = require('gulp-jshint');
var gp_replace = require('gulp-replace');
var gp_strip = require('gulp-strip-comments');

var gp_newer = require('gulp-newer');
var gp_download = require('gulp-download');
var gp_tagversion = require('gulp-tag-version');
var gp_git = require('gulp-git');
var gp_bump = require('gulp-bump');
var gp_filter = require('gulp-filter');

var fs = require('fs');


//Test depends on build so is run after the new version is ready
gulp.task('test', ['build', 'build_separated', 'get_sample_data'], function(){
    return gulp.src('./test/test.js', {read: false})
        .pipe(gp_mocha({reporter: 'nyan'}));
});

gulp.task('lint', function() {
    return gulp.src('./src/*.js')
        .pipe(gp_jshint())
        .pipe(gp_jshint.reporter('default'));
});

gulp.task('license_year', function() {
  /*gulp-licence didn't work, so I change year manually*/
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

gulp.task('build', function(){
    return gulp.src(['./src/*.js'])
        .pipe(gp_newer('composite-projections.js'), {extension: '.js'})
        .pipe(gp_strip())
        .pipe(gp_concat('composite-projections.js'))
        .pipe(gulp.dest('./'))
        .pipe(gp_rename('composite-projections.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('build_separated', function(){

    return gulp.src(['./src/*.js'])
        .pipe(gp_newer({dest: './', map: function(name){
          return name.replace('.js','.min.js');}
        }))
        .pipe(gp_strip())
        .pipe(gp_rename(function (path) {
          path.extname = ".min.js";
        }))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./'));
});


gulp.task('get_sample_data', function(){
  //Gets the neecssary topojsons for running the tests
  var outDir = "test/data_files";
  var dataFiles = ["https://cdn.rawgit.com/rveciana/5919944/raw//provincias.json",
      "http://bl.ocks.org/mbostock/raw/4090846/us.json",
      "https://cdn.rawgit.com/mbostock/4090846/raw//world-50m.json",
      "https://gist.githubusercontent.com/rveciana/5919944/raw/b1f826319231c3e06d6e8548bc947ca2c29dc9e8/france.json",
      "https://gist.githubusercontent.com/rveciana/5919944/raw/19dc3e37a6ca5ebb05d3a2d96a1f499d6cc3411c/nuts0.json",
      "https://gist.githubusercontent.com/rveciana/5919944/raw/a3d0f29d851893e15dcf6194997453086c408fd3/japan.json"];
  var filesToDownload = [];
  for (i = 0; i < dataFiles.length; i++){
    if(! fs.existsSync(outDir + "/" + dataFiles[i].split('/').reverse()[0])) {
      filesToDownload.push(dataFiles[i]);
    }
  }

  if (filesToDownload.length > 0)
    return gp_download(filesToDownload)
      .pipe(gulp.dest("test/data_files"));
  else
    return true;
});

//Functions to tag easily the versions so npm and bower go together
function inc(importance) {
  return gulp.src(['./package.json', './bower.json'])
  .pipe(gp_bump({type: importance}))
  .pipe(gulp.dest('./'))
  .pipe(gp_git.commit('Creating new package version'))
  .pipe(gp_filter('package.json'))
  .pipe(gp_tagversion());
};

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })
gulp.task('push', function(){
  gp_git.push('origin', 'master', {args: " --follow-tags"}, function (err) {
    if (err) throw err;
  });
});



gulp.task('default', ['lint','build', 'build_separated','test','license_year'], function(){});
