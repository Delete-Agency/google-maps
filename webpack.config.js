const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    return {
        mode: "production",
        entry: {
            "google-maps": ["./src/index.js"]
        },
        output: {
            path: __dirname + '/standalone',
            filename: "[name].min.js",
            library: 'GoogleMaps',
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: ['.js'],
            modules: ['node_modules']
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        useBuiltIns: 'usage',
                                        corejs: 3
                                    }
                                ]
                            ]
                        }
                    }
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
        ],
    }
};
