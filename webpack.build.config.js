const baseConfig = require('./webpack.base.config');

module.exports = (env, argv) => {
    const config = baseConfig(env, argv);
    config.output.path = __dirname + '/lib';
    config.output.filename = 'index.js';
    config.mode = 'development';
    return config;
};