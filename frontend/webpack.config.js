var sliceArgs = Function.prototype.call.bind(Array.prototype.slice);
var toString = Function.prototype.call.bind(Object.prototype.toString);
var path = require('path');
var webpack = require('webpack');
var LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
var CompressionPlugin = require("compression-webpack-plugin");
var ngTools = require('@ngtools/webpack');
// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    devtool: 'source-map',

    entry: {
        'vendor': [
            // Polyfills
            'es6-shim',
            'es6-promise',
            'reflect-metadata',
            'zone.js/dist/zone',
            'zone.js/dist/long-stack-trace-zone',
            // RxJS
            'rxjs',

        ],
        'app': './src/app/bootstrap.ts',
    },

    // Config for our build files
    output: {
        path: root('build'),
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        chunkFilename: '[id].chunk.js'
    },


    resolve: {
            modules: [
      'node_modules',
      root('./app')
    ],
        extensions: [
            '.ts',
            '.js',
            '.json',
            '.css',
            '.html'
        ]
    },

    module: {
        loaders: [
            // Support for .ts files.
            {
                test: /\.ts$/,
                include: [path.resolve(__dirname), root('./aot-compiled')],
                exclude: [/\.(spec|e2e)\.ts$/],
                use: [
                'awesome-typescript-loader',
                'angular2-template-loader',
                'angular2-router-loader',
                'angular2-load-children-loader'
                // '@ngtools/webpack'
                ],
            },

            // Support for *.json files.
            { test: /\.json$/, loader: 'json-loader' },

            // Support for CSS as raw text
            { test: /\.css$/, loader: 'raw-loader' },

            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader' },
        ],
        noParse: [
            /zone\.js\/dist\/.+/,
            /reflect-metadata/,
            /es(6|7)-.+/,
        ]
    },

    plugins: [
        new CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.js', minChunks: Infinity }),
        new CommonsChunkPlugin({ name: 'common', filename: 'common.js', minChunks: 2, chunks: ['app', 'vendor'] }),



        // Used for AoT Compilation
        // new ngTools.AotPlugin({
        //     tsConfigPath: './tsconfig-aot.json',
        //     baseDir: process.cwd(),
        //     entryModule: './src/app/app.module#AppModule'
        // }),

        // Gzip code
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$|\.ts$/,
            threshold: 10240,
            minRatio: 0.6
        }),


        new LoaderOptionsPlugin({
            debug: false,
            options: {
                resolve: {},
                /**
                 * Static analysis linter for TypeScript advanced options configuration
                 * Description: An extensible linter for the TypeScript language.
                 *
                 * See: https://github.com/wbuchwalter/tslint-loader
                 */
                tslint: {
                    emitErrors: true,
                    failOnHint: true,
                    resourcePath: 'src'
                },


                /**
                 * Html loader advanced options
                 *
                 * See: https://github.com/webpack/html-loader#advanced-options
                 */
                // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
                htmlLoader: {
                    minimize: true,
                    removeAttributeQuotes: false,
                    caseSensitive: true,
                    customAttrSurround: [
                        [/#/, /(?:)/],
                        [/\*/, /(?:)/],
                        [/\[?\(?/, /(?:)/]
                    ],
                    customAttrAssign: [/\)?\]?=/]
                },

            }
        }),
    ],

};

function getBanner() {
    return 'This is a sample that shows how to add authentication to an Angular 2 (ng2) app by @auth0';
}

function root(args) {
    args = sliceArgs(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}

function rootNode(args) {
    args = sliceArgs(arguments, 0);
    return root.apply(path, ['node_modules'].concat(args));
}
