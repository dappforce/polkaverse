import gql from 'graphql-tag'

export const PENDING_ORDERS_BY_IDS = gql`
  query GetPendingOrdersByIds($ids: [String!]!) {
    getPendingOrdersByIds(ids: $ids) {
      orders {
        id
        account
        clientId
        timestamp
      }
    }
  }
`

export const PENDING_ORDERS_BY_ACCOUNT = gql`
  query GetPendingOrdersByAccount($account: String!) {
    getPendingOrdersByAccount(account: $account) {
      orders {
        id
        account
        clientId
        timestamp
      }
    }
  }
`

export const SELLER_CONFIG = gql`
  query getSellerConfig {
    sellerConfigInfo {
      dmnRegPendingOrderExpTime
      domainHostChain
      domainHostChainPrefix
      domainRegistrationPriceFixed
      remarkProtName
      remarkProtVersion
      sellerApiAuthTokenManager
      sellerChain
      sellerChainPrefix
      sellerTreasuryAccount
      sellerToken {
        decimal
        name
      }
    }
  }
`

export const PROCESSING_REGISTRATION_ORDERS = gql`
  query getRegistationOrdersByDomain($domain: String, $recipient: Stirng) {
    domainRegistrationOrders(
      limit: 10
      where: {
        domain: { id_eq: $domain }
        status_eq: Processing
        target: { id_eq: $recipient }
      }
    ) {
      id
      status
      refundStatus
      target {
        id
      }
    }
  }
`

export const CREATE_PENDING_ORDER = gql`
  mutation CreatePendingOrder($domain: String!, $destination: String!, $account: String!) {
    createPendingOrder(account: $account, destination: $destination, domain: $domain)
  }
`

export const DELETE_PENDING_ORDER = gql`
mutation DeletePendingOrderById($id: String!) {
  deletePendingOrderById(id: $id)
}

`
