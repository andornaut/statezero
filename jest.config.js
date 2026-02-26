module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/test/test_*.js"],
  transformIgnorePatterns: ["/node_modules/(?!lodash-es)"],
};
