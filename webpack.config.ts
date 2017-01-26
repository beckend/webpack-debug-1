import * as path from 'path';
import * as webpack from 'webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { Configuration } from 'webpack';

const { extract: extractCss } = ExtractTextPlugin;
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATH_ROOT = __dirname;
const PATH_SRC = path.join(PATH_ROOT, 'src');
const PATH_BUILD = path.join(PATH_ROOT, 'build');

export default () => {
  const { NODE_ENV } = process.env;
  const isProd = NODE_ENV === 'production';
  const isDev = !isProd;

  const cssLoaderNormal = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        importLoaders: 1,
        minimize: isProd
      }
    },
    {
      loader: 'postcss-loader'
    }
  ];

  const cssLoaderLocal = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        importLoaders: 1,
        localIdentName: '[name]_[local]_[hash:base64:3]',
        modules: true,
        minimize: isProd
      }
    },
    {
      loader: 'postcss-loader'
    }
  ];

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
        },

        {
          test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf|ico|wav|mp3|flac|ogg|oga|wma)(\?.*)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[sha512:hash:base64:7].[ext]',
              }
            }
          ]
        },

        // normal css loader
        {
          exclude: [
            /\.local\.(css)$/,
            /[\/\\]node_modules[\/\\]flexboxgrid/,
          ],
          test: /\.(css)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderNormal
            ]
          } as any)
        },

        // local css loader
        {
          exclude: [
            /node_modules/,
          ],
          test: /\.local\.(css)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal
            ]
          } as any)
        },

        // Local sass specific node_modules includes
        {
          include: [
            /[\/\\]node_modules[\/\\]flexboxgrid/,
          ],
          test: /\.(css)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal
            ]
          } as any)
        },

        // normal sass loader
        {
          exclude: [
            /\.local\.(scss)$/,
            /[\/\\]node_modules[\/\\]react-toolbox/,
          ],
          test: /\.(scss)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderNormal,
              {
                loader: 'resolve-url-loader'
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          } as any)
        },

        // local sass loader
        {
          exclude: [
            /node_modules/,
          ],
          test: /\.local\.(scss)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
              {
                loader: 'resolve-url-loader'
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          } as any)
        },

        // Local sass specific node_modules includes
        {
          include: [
            /[\/\\]node_modules[\/\\]react-toolbox/,
          ],
          test: /\.(scss)$/,
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
              {
                loader: 'resolve-url-loader'
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          } as any)
        }
      ]
    },
    plugins: [
      new (webpack as any).ProgressPlugin(),

      new TsConfigPathsPlugin(),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        inject: true,
        minify: false,
        template: path.join(PATH_SRC, 'index.pug'),
      }),

      new ExtractTextPlugin({
        allChunks: true,
        disable: false,
        filename: '[name]-[chunkhash].css',
      }),

      new webpack.LoaderOptionsPlugin({
        debug: isDev,
        minimize: isProd,
        options: {
          context: PATH_SRC,
          debug: isDev,
          // Needed for plugins that relies on context...
          // they lose other props when in LoaderOptionsPlugin
          // https://github.com/webpack/webpack/issues/3018
          output: {
            path: PATH_BUILD,
          },

          postcss: () => ([
            require('postcss-cssnext')({ browsers: ['last 2 versions', 'IE > 10'] })
          ]),
        }
      })
    ]
  };

  Boolean(config as Configuration)

  return config;
};
