import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as glob from 'glob';
import * as path from 'path';
import * as webpack from 'webpack';
import { Configuration } from 'webpack';

const { extract: extractCss } = ExtractTextPlugin;
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PurifyPlugin = require('purifycss-webpack');

const PATH_ROOT = __dirname;
const PATH_SRC = path.join(PATH_ROOT, 'src');
const PATH_BUILD = path.join(PATH_ROOT, 'build');
const globPurifyExtensions = '{js,jsx,ts,tsx,html,pug,css,scss}';

export default () => {
  const { NODE_ENV } = process.env;
  const isProd = NODE_ENV === 'production';
  const isDev = !isProd;

  const cssLoaderNormal = [
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        minimize: isProd,
        sourceMap: true,
      },
    },
    {
      loader: 'postcss-loader',
    },
  ];

  const cssLoaderLocal = [
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        localIdentName: '[name]_[local]_[hash:base64:3]',
        minimize: isProd,
        modules: true,
        sourceMap: true,
      },
    },
    {
      loader: 'postcss-loader',
    },
  ];

  const config = {
    context: PATH_SRC,

    devtool: 'source-map' as any,

    entry: {
      main: [
        path.join(PATH_SRC, './main.tsx'),
      ],
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
            },
          ],
        },

        {
          test: /\.(pug)$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: false,
              },
            },
          ],
        },

        {
          test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf|ico|wav|mp3|flac|ogg|oga|wma)(\?.*)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[sha512:hash:base64:7].[ext]',
              },
            },
          ],
        },

        // normal css loader
        {
          exclude: [
            /\.local\.(css)$/,
            /[\/\\]node_modules[\/\\]flexboxgrid/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderNormal,
            ],
          } as any),
          test: /\.(css)$/,
        },

        // local css loader
        {
          exclude: [
            /node_modules/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
            ],
          } as any),
          test: /\.local\.(css)$/,
        },

        // Local sass specific node_modules includes
        {
          include: [
            /[\/\\]node_modules[\/\\]flexboxgrid/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
            ],
          } as any),
          test: /\.(css)$/,
        },

        // normal sass loader
        {
          exclude: [
            /\.local\.(scss)$/,
            /[\/\\]node_modules[\/\\]react-toolbox/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderNormal,
              {
                loader: 'resolve-url-loader',
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          } as any),
          test: /\.(scss)$/,
        },

        // local sass loader
        {
          exclude: [
            /node_modules/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
              {
                loader: 'resolve-url-loader',
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          } as any),
          test: /\.local\.(scss)$/,
        },

        // Local sass specific node_modules includes
        {
          include: [
            /[\/\\]node_modules[\/\\]react-toolbox/,
          ],
          loaders: extractCss({
            loader: [
              ...cssLoaderLocal,
              {
                loader: 'resolve-url-loader',
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          } as any),
          test: /\.(scss)$/,
        },
      ],
    },

    output: {
      chunkFilename: '[name]-[chunkhash].js',
      filename: '[name]-[hash].js',
      path: PATH_BUILD,
      publicPath: '',
    },

    plugins: [
      new (webpack as any).ProgressPlugin(),

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
            require('postcss-cssnext')({ browsers: ['last 2 versions', 'IE > 10'] }),
          ]),
        },
      }),

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

      isProd && new PurifyPlugin({
        moduleExtensions: [
          '.html',
          '.pug',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.css',
          '.less',
          '.sass',
          '.scss',
          '.styl',
        ],
        // Give paths to parse for rules. These should be absolute!
        paths: {
          main: glob.sync(`${PATH_SRC}/**/*.${globPurifyExtensions}`),
        },
        purifyOptions: {
          info: true,
          minify: true,
          rejected: false,
        },
        styleExtensions: [
          '.css',
          '.less',
          '.sass',
          '.scss',
          '.styl',
        ],
      }),
    ].filter(Boolean),

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
  };

  Boolean(config as Configuration);

  return config;
};
