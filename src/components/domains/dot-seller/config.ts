import BN from 'bn.js'
import { GraphQLClient } from 'graphql-request'

export const validDomainPrice = new BN('100000000') // 0.01

export const domainsNetwork = 'rococo'

export const xSellerSquid = 'https://squid.subsquid.io/x-seller-squid-rococo-soon/graphql'

export const sellerSquidGraphQlClient = new GraphQLClient(xSellerSquid)