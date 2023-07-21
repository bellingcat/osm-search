const webpack = require('webpack');

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [
        new webpack.DefinePlugin({
            // allow access to process.env from within the vue app
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
}
});
