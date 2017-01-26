import * as path from 'path';
import * as webpack from 'webpack';
import { Configuration } from 'webpack';

const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATH_ROOT = __dirname;
const PATH_SRC = path.join(PATH_ROOT, 'src');
const PATH_BUILD = path.join(PATH_ROOT, 'build');

export default () => {
  const { NODE_ENV } = process.env;
  const isProd = NODE_ENV === 'production';

  const config = {
    context: PATH_SRC,
    entry: {
      main: [
        path.join(PATH_SRC, './main.tsx'),
      ]
    },
    output: {
      chunkFilename: '[name]-[chunkhash].js',
      filename: '[name]-[hash].js',
      path: PATH_BUILD,
      publicPath: '',
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    devtool: 'source-map' as any,

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'awesome-typescript-loader'
            }
          ]
        },
        {
          test: /\.(pug)$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: false,
              }
            }
          ]
        }
      ]
    },
    plugins: [
        new TsConfigPathsPlugin(),

        new HtmlWebpackPlugin({
          filename: 'index.html',
          inject: true,
          minify: false,
          template: path.join(PATH_SRC, 'index.pug'),
        }),

        new webpack.LoaderOptionsPlugin({
          debug: true,
          minimize: isProd,
          options: {
            context: PATH_SRC,
            debug: true,
            // Needed for plugins that relies on context...
            // they lose other props when in LoaderOptionsPlugin
            // https://github.com/webpack/webpack/issues/3018
            output: {
              path: PATH_BUILD,
            }
          }
        })
    ]
  };

  Boolean(config as Configuration)

  return config;
};
