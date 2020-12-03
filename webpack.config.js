const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    target: 'web',
    entry: {
        demo: ['./examples/index.ts'],
        wla: ['./src/index.ts']
    },
    output: {
        filename: '[name].[chunkhash:6].js',
        path: path.resolve(__dirname, 'output'),
        library: 'WLA',
        libraryTarget: 'window',
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
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.json',
                        },
                    }
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