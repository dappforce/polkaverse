import { GraphQLClient } from 'graphql-request'
import config from 'src/config'

const { sellerSquid } = config

export const sellerSquidGraphQlClient = new GraphQLClient(sellerSquid ?? '')

export const NONCE = 111
