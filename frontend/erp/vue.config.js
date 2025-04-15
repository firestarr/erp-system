// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('webpack').DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
    ]
  }
}