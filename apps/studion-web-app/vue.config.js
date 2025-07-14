const fs = require('fs')

const vueConfig = {
  productionSourceMap: process.env.NODE_ENV !== 'production',

  devServer: {
    host: process.env.VUE_APP_HOST,
    port: 8080,
    https: false,

    before: function (app) {
      app.get('/config', function (req, res) {
        try {
          let configs = JSON.parse(fs.readFileSync('src/configs.json', 'utf8'))

          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          const envConfig = configs.find((environment) => {
            return environment.linkedDomains.includes(req.headers.host)
          })

          if (envConfig) {
            return res.status(200).send(JSON.stringify(envConfig))
          }

          return res.status(404).send(JSON.stringify('config_not_found'))
        } catch (error) {
          return res.status(500).send(JSON.stringify(error.message))
        }
      })
    },
  },

  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.mode = 'production'
      config.optimization.nodeEnv = 'production'
      config.optimization.minimize = true
      config.optimization.splitChunks.chunks = 'all'
      config.output.filename = `js/[name].${Date.now()}.js`
      config.output.chunkFilename = `js/[name].${Date.now()}.js`
    }
  },

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule.use('svg-inline-loader').loader('svg-inline-loader')
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: ``,
      },
    },
    extract: {
      filename: `css/[name].${Date.now()}.css`,
      chunkFilename: `css/[name].${Date.now()}.css`,
    },
  },
}

if (process.env.HSW_ENABLED) {
  const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

  vueConfig.configureWebpack.plugins.push(new HardSourceWebpackPlugin())
}

module.exports = vueConfig
