const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __DARWIN__: (process.env.PLATFORM || process.platform) === 'darwin',
      __WIN32__: (process.env.PLATFORM || process.platform) === 'win32',
      __LINUX__: (process.env.PLATFORM || process.platform) === 'linux'
    })
  ]
}