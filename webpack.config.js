// Learn more on how to config.
// - https://github.com/ant-tool/atool-build#配置扩展

/*const webpack = require('atool-build/lib/webpack');
const fs = require('fs');
const path = require('path');
const glob = require('glob');*/


module.exports = function (webpackConfig) {
  console.log(webpackConfig);
  if(process.env.NODE_ENV === 'production'){
    /*webpackConfig.plugins.push(
        // Other plugins.
        // WebpackClearConsole plugin removes all statements beginning with console.
        new WebpackClearConsole()
    )*/
  }
  if(process.env.NODE_ENV === 'development'){

  }

  /*webpackConfig.plugins.push(
      new webpack.DllReferencePlugin({
        context: path.join(__dirname, "public", "dll"),
        manifest: require("./dll/vendor-manifest.json") // eslint-disable-line
      })
  );*/

  // Enable this if you have to support IE8.
  // webpackConfig.module.loaders.unshift({
  //   test: /\.jsx?$/,
  //   loader: 'es3ify-loader',
  // });

/*  webpackConfig.externals=Object.assign( {},  {
    "g2": "G2",
    "g-cloud": "Cloud",
    "g2-plugin-slider": "G2.Plugin.slider",
    "hosts": "vHost_host"
  })*/

  // Load src/entries/*.js as entry automatically.
 /* const files = glob.sync('./src/index.js');
  const newEntries = files.reduce(function(memo, file) {
    const name = path.basename(file, '.js');
    memo[name] = file;
    return memo;
  }, {});
  webpackConfig.entry = Object.assign({}, webpackConfig.entry, newEntries);*/

  console.log(webpackConfig);

  return webpackConfig;
};
