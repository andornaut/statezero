const webpackConfig = require('./webpack.config')({}, { mode: 'development' });

const TEST_FILES = 'test/index.js';

module.exports = (config) => {
  const autoWatch = !!config.WATCH;
  config.set({
    autoWatch,
    browserNoActivityTimeout: 60000,
    browsers: ['ChromeNoSandbox'],
    captureConsole: true,
    customLaunchers: {
      ChromeNoSandbox: {
        base: autoWatch ? 'Chrome' : 'ChromeHeadless',
        flags: ['--disable-gpu', '--disable-web-security', '--no-sandbox'],
      },
    },
    files: [TEST_FILES],
    frameworks: ['mocha', 'sinon-chai'],
    // logLevel: config.LOG_DEBUG,
    preprocessors: {
      [TEST_FILES]: ['webpack'],
    },
    reporters: ['mocha'],
    singleRun: !autoWatch,
    webpack: webpackConfig,
    webpackMiddleware: { noInfo: true },
    client: {
      mocha: {
        timeout: 10000,
      },
    },
  });
};
