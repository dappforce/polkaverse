import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3003',
    env: {
      my_address: '3shk6xYyNwwL5yvDVCUoUVoa8iUu3QmsR64kVqi2jL25kyzf',
      my_space: '5496',
      my_post: '36193',

      fresh_account: '5HbAUnWjfS6xix33S5RMi1R99oG2TDMraQSRY4bP3fvycbSa',
      account_with_energy: '5FHYXx3iHURLfdNk5svSQMuZA7nvzsk5CfwFtQMtivYWcYjG',
    },
  },
})
