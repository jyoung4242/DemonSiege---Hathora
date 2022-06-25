const path = require('path');
const webpack = require('webpack');
const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        index: path.resolve(__dirname, './src/index.ts'),
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].bundle.js',
    },
    mode: mode,
    devServer: {
        static: './build',
        port: '8000',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/template.html'),
        }),
        new webpack.EnvironmentPlugin({ COORDINATOR_HOST: null, MATCHMAKER_HOST: null }),
    ],
};
