import {
    src,
    dest,
    watch,
    parallel,
    series
} from 'gulp'
import del from 'del'
import sass from 'gulp-sass'
import rollup from 'gulp-better-rollup'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import nunjucks from 'gulp-nunjucks'
import browserSync from 'browser-sync'
import uglify from 'gulp-uglify'
import imagemin from 'gulp-imagemin'

const dirs = {
    src: 'src',
    dist: 'dist'
}

const sources = {
    styles: {
        dev: `${dirs.src}/scss/styles.scss`,
        dist: `${dirs.dist}/assets/styles`,
        sass: `${dirs.src}/scss/**/*.scss`
    },
    scripts: {
        dev: `${dirs.src}/scripts/*.js`,
        dist: `${dirs.dist}/assets/scripts`,
    },
    templates: {
        dev: `${dirs.src}/template/*.html`,
        other: `${dirs.src}/template/**/*.html`,
        dist: `${dirs.dist}`,
    },
    images: {
        dev: `${dirs.src}/images/*`,
        dist: `${dirs.dist}/assets/images`
    }
}

export const buildStyles = () => src(sources.styles.dev)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(dest(sources.styles.dist))
    .pipe(browserSync.reload({ stream:true }))

export const buildScripts = () => src(sources.scripts.dev)
    .pipe(rollup({ 
            plugins: [
                babel(), 
                resolve(), 
                commonjs()
            ] 
        }, 'umd'))
    .pipe(uglify())
    .pipe(dest(sources.scripts.dist))
    .pipe(browserSync.reload({ stream:true }))

export const buildTemplate = () => src(sources.templates.dev)
    .pipe(nunjucks.compile())
    .pipe(dest(sources.templates.dist))
    .pipe(browserSync.reload({ stream:true }))

export const buildImages = () => src(sources.images.dev)
    .pipe(imagemin())
    .pipe(dest(sources.images.dist))
    .pipe(browserSync.reload({ stream:true }))

export const devWatch = () => {
    browserSync.init({
        server: dirs.dist
    })

    watch(sources.styles.sass, buildStyles)
    watch(sources.scripts.dev, buildScripts)
    watch([sources.templates.dev, sources.templates.other], buildTemplate).on('change', browserSync.reload)
    watch(sources.images.src, buildImages).on('change', browserSync.reload)
}

export const clean = () => del([dirs.dist])

export const dev = series(clean, parallel(buildStyles, buildScripts, buildTemplate, buildImages), devWatch)

export const build = series(clean, parallel(buildStyles, buildScripts, buildTemplate, buildImages))

export default dev



