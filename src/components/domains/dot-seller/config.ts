import { GraphQLClient } from 'graphql-request'

export const domainsNetwork = 'rococo'

export const xSellerSquid = 'https://squid.subsquid.io/x-seller-squid-rococo-soon/graphql'

export const sellerSquidGraphQlClient = new GraphQLClient(xSellerSquid)