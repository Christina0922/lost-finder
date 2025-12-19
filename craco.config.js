module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "stream": false,
        "http": false,
        "https": false,
        "url": false,
        "zlib": false,
        "os": false,
        "net": false,
        "tls": false,
        "fs": false,
        "path": false,
        "util": false,
        "querystring": false,
      };
      return webpackConfig;
    },
  },
}; 