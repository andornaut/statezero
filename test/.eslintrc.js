const rootConfig = require("../.eslintrc");

module.exports = {
  ...rootConfig,
  env: {
    ...rootConfig.env,
    jest: true,
  },
};
