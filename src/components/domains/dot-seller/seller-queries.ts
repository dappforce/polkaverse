import gql from 'graphql-tag'

export const PENDING_ORDERS_BY_IDS = gql`
  query GetPendingOrdersByIds($ids: [String!]!) {
    getPendingOrdersByIds(ids: $ids) {
      orders {
        id
        createdByAccount
        purchaseInterrupted
        signer
        target
        timestamp
        destination
      }
    }
  }
`

export const PENDING_ORDERS_BY_SIGNER = gql`
  query GetPendingOrdersBySigner($signer: String!) {
    getPendingOrdersBySigner(signer: $signer) {
      orders {
        id
        createdByAccount
        purchaseInterrupted
        signer
        target
        timestamp
        destination
      }
    }
  }
`

export const PENDING_ORDERS_BY_ACCOUNT = gql`
  query GetPendingOrdersByAccount($createdByAccount: String!) {
    getPendingOrdersByCreatedByAccount(createdByAccount: $createdByAccount) {
      orders {
        id
        createdByAccount
        purchaseInterrupted
        signer
        target
        timestamp
        destination
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
  query getRegistationOrdersByDomain($domains: [String!]!, $recipient: String!) {
    domainRegistrationOrders(
      limit: 10
      where: { domain: { id_in: $domains }, status_eq: Processing, target: { id_eq: $recipient } }
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
  mutation CreatePendingOrder(
    $destination: String!
    $domain: String!
    $signer: String!
    $target: String!
    $createdByAccount: String!
  ) {
    createPendingOrder(
      destination: $destination
      domain: $domain
      signer: $signer
      target: $target
      createdByAccount: $createdByAccount
    )
  }
`

export const DELETE_PENDING_ORDER = gql`
  mutation DeletePendingOrderById($id: String!) {
    deletePendingOrderById(id: $id)
  }
`

export const UPDATE_PENDING_ORDER = gql`
  mutation updatePendingOrderPurchaseStatusById($id: String!, $interrupted: Boolean!) {
    updatePendingOrderPurchaseStatusById(id: $id, interrupted: $interrupted)
  }
`
