const { injectBabelPlugin } = require('react-app-rewired');

module.exports = (config) => injectBabelPlugin('transform-decorators-legacy', config);
