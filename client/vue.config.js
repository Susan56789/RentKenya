const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: '/',  
  transpileDependencies: true,


  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer'),
          ],
        },
      },
    },
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'RentKenya'
        args[0].description = 'RentKenya is a web application that allows users to post, view, and manage vacant houses for rent.'
        args[0].keywords = 'Houses for Rent in Kenya, Property to Rent in Nairobi, Affordable Houses for Rent in Kenya,Houses for rent near me, Cheap houses for rent, 1 bedroom houses for rent in Nairobi'
        return args
      })
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
      },
    },
  },
})
