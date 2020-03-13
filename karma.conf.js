const webpackConfig = require('./webpack.config')({}, { mode: 'development' });

const TEST_FILES = 'test/test_*.js';

module.exports = (config) => {
  const autoWatch = !!config.WATCH;
  config.set({
    autoWatch,
    browsers: ['ChromeHeadless'],
    files: [TEST_FILES],
    frameworks: ['mocha', 'sinon-chai'],
    preprocessors: {
      [TEST_FILES]: ['webpack'],
    },
    reporters: ['mocha'],
    singleRun: !autoWatch,
    webpack: webpackConfig,
    webpackMiddleware: { noInfo: true },
  });
};
