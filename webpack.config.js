const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    // devtool: 'inline-source-map',
    target: 'web',
    entry: {
        demo: ['./examples/index.ts']
    },
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'output'),
        // publicPath: '/view'
    },
    plugins: [
        new CleanWebpackPlugin(['output']),
        new HtmlWebpackPlugin({
            filename: 'demo.html',
            template: './examples/index.html',
            title: 'Demo Title',
            // chunksSortMode: none
        }),
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                        }
                    },
                    'ts-loader'
                ]
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                }
            },
            {
                test: /\.(css|less)$/,
                use: [
                    'css-loader',
                    'less-loader'
                ]
            },
        ]
    }
};