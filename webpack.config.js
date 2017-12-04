const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        demo: './examples/index.js'
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin(['build']),
        new HtmlWebpackPlugin({
            title: 'Output Management',
        }),
        new HtmlWebpackPlugin({
            filename: 'demo.html',
            // template: path.resolve(dirVars.pagesDir, `./${page}/html.js`),
            template: './examples/index.html',
            title: 'Demo Title',
            // hash: true,
            // minify: true,
            // xhtml: true,
        })
        //extract-text-webpack-plugin
    ],
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    // options: {
                    //     attrs: [':data-src']
                    // }
                }
            },
            {
                test: /\.(css|less)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ]
            }
            // test: /\.(png|jpg|gif)$/,
            // loader: 'url?limit=8192&name=./static/img/[hash].[ext]',
        ]
    },
    // devServer: {
    //     contentBase: './build'
    // },
};