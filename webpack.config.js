const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    popup: './src/popup/index.ts',
    background: './src/background/index.ts',
    content: './src/content/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json" },
        { from: "src/popup/popup.html" },
        { from: "src/styles/output.css", to: "styles/output.css" },
        { 
          from: "src/assets",
          to: "assets",
          noErrorOnMissing: true
        }
      ],
    }),
  ],
  devtool: 'source-map'
}; 