var webpackTestConfig = require('./webpack-test.config')


module.exports = function (config) {
  config.set({
    browsers: ['ChromiumHeadless'],
    frameworks: ['mocha', 'sinon-chai'],
    files: ['../test/index.js'],
    preprocessors: {
      '../test/index.js': ['webpack'],
    },
    webpack: webpackTestConfig,
    webpackMiddleware: {
      noInfo: true,
    },
  })
}
