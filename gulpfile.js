const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();

// Extra plugins

const htmlmin = require('gulp-htmlmin');
const csso = require('postcss-csso');
const jsmin = require('gulp-jsmin');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const rename = require("gulp-rename");
const del = require('del');
// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename("style.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(postcss([
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;


// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo(),
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;


// Create webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp.src("source/img/**/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/icons"))
}

exports.sprite = sprite;

exports.sprite = sprite;

// Scripts

const scripts = () => {
  return gulp.src("source/js/*.js")
    .pipe(jsmin())
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Make copy files

const copy = (done) => {
  return gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg,webp}"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
  done();
}

exports.copy = copy;
// Server

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles", reload));
  gulp.watch("source/*.html", gulp.series(html, reload));
  // gulp.watch("source/*.html").on("change", sync.reload);
  gulp.watch("source/js/*.js", gulp.series(scripts))
}


const reload = done => {
  sync.reload();
  done();
}

const myBuild = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    scripts,
    images,
    //sprite,
    createWebp,
    copy
  )
);

exports.build = myBuild;

// Default

exports.default = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    images,
    createWebp,
    //sprite,
    copy
  ),
  gulp.series(
    server,
    watcher
  )
);
