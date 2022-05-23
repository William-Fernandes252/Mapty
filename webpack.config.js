const path = require('path');

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            leaflet_css: __dirname + '/node_modules/leaflet/dist/leaflet.css',
            leaflet_marker:
                __dirname + '/node_modules/leaflet/dist/images/marker-icon.png',
            leaflet_marker_2x:
                __dirname +
                '/node_modules/leaflet/dist/images/marker-icon-2x.png',
            leaflet_marker_shadow:
                __dirname +
                '/node_modules/leaflet/dist/images/marker-shadow.png',
        },
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
