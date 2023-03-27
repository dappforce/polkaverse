import webpack from '@cypress/webpack-preprocessor'
import { defineConfig } from 'cypress'

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  on(
    'file:preprocessor',
    webpack({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'ts-loader',
                },
              ],
            },
          ],
        },
      },
    }),
  )

  // Make sure to return the config object as it might have been modified by the plugin.
  return config
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3003',
    responseTimeout: 50000,
    env: {
      my_address: '3shk6xYyNwwL5yvDVCUoUVoa8iUu3QmsR64kVqi2jL25kyzf',
      my_space: '5496',
      my_post: '36193',

      fresh_account: '5HbAUnWjfS6xix33S5RMi1R99oG2TDMraQSRY4bP3fvycbSa',
      account_with_energy: '5FHYXx3iHURLfdNk5svSQMuZA7nvzsk5CfwFtQMtivYWcYjG',

      // will have to run server locally to bypass hCaptcha  verification
      offchainSignerApiBaseUrl: 'http://127.0.0.1:3000',
    },
    setupNodeEvents,
  },
})
