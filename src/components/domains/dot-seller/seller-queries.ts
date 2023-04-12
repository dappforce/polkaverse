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
