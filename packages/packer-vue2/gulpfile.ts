import gulp from 'gulp';
import tsc from 'gulp-typescript';
import webpack from 'webpack';
import { server as serverConfig, client as clientConfig } from './src/single-vue/webpack.config';

const build = function build(config, cb) {
  webpack(config, (err, stats) => {
    if (err) {
      throw err;
    }
    console.log(stats.toString({ colors: true }));
    cb();
  });
};

// single-vue 构建任务
gulp.task('build:single-vue:server', cb => build(serverConfig, cb));
gulp.task('build:single-vue:client', cb => build(clientConfig, cb));

// src 构建任务
gulp.task('build:src', () => gulp
  .src(['src/**/*.ts', '!src/single-vue/**'])
  .pipe(tsc.createProject('./tsconfig.json')())
  .pipe(gulp.dest('./lib/')));

// 完整构建
gulp.task('build', gulp.parallel('build:single-vue:server', 'build:single-vue:client', 'build:src'));

// 开发模式，启动监听
gulp.task(
  'watch',
  gulp.series('build', () => {
    gulp.watch(['src/**/*.ts', '!src/single-vue/**'], gulp.series('build:src'));
    gulp.watch(['src/single-vue/*.ts'], gulp.parallel('build:single-vue:server', 'build:single-vue:client'));
  }),
);
