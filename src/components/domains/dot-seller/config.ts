import BN from 'bn.js'
import { SocialRemarkMessageProtocolName } from '@subsocial/utils'
import { GraphQLClient } from 'graphql-request'

export const validDomainPrice = new BN('100000000') // 0.01

export const testRemarkTitle: SocialRemarkMessageProtocolName = 'social_t_0'

export const domainsNetwork = 'rococo'

export const treasuryAccount = '3qjCbqfT6CyiYVVrwvr3VeYTCX1X5VY2v3WJ2K9YW5znP27B'

export const xSellerSquid = 'https://squid.subsquid.io/x-seller-squid-rococo-soon/graphql'

export const sellerSquidGraphQlClient = new GraphQLClient(xSellerSquid)