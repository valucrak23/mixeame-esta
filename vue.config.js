const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  indexPath: 'index.html',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Mixeame Esta',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  }
}) 