import { newLogger } from '@subsocial/utils'
import axios from 'axios'
import config from 'src/config'
import { AccountId, ElasticQueryParams } from 'src/types'

const { offchainUrl, subIdApiUrl } = config

const log = newLogger('OffchainRequests')

function getOffchainUrl(subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

type AxiosResponse<T = any> = {
  data: T
  status: number
}

const axiosRequest = async (url: string): Promise<AxiosResponse | undefined> => {
  try {
    const res = await axios.get(url)
    if (res.status !== 200) {
      log.error('Failed request to offchain with status', res.status)
    }

    return res
  } catch (err) {
    log.error('Failed request to offchain with error', err)
    return undefined
  }
}

export type SearchResultsType = {
  _index: string
  _id: string
}

type ElasticQueryParamsWithSpaceId = ElasticQueryParams & {
  spaceId: string
}

export const queryElasticSearch = async (
  params: ElasticQueryParamsWithSpaceId,
): Promise<SearchResultsType[] | undefined> => {
  try {
    const res = await axios.get(getOffchainUrl('/search'), { params })
    if (res.status === 200) {
      return res.data
    }
    return []
  } catch (err) {
    log.error('Failed to query Elasticsearch:', err)
    return []
  }
}

export const getChainsInfo = async () => {
  const res = await axiosRequest(`${subIdApiUrl}/chains/properties`)
  return res?.data
}

export const getStakeAmount = async ({
  address,
  spaceId,
}: {
  spaceId: string
  address: string
}) => {
  const res = await axiosRequest(
    `http://localhost:3001/api/v1/staking/creator/backer/info?account=${address}&ids=${spaceId}`,
  )
  // const res = await axiosRequest(
  //   `${subIdApiUrl}/staking/creator/backer/info?account=${address}&ids=${spaceId}`,
  // )
  const newestStakeInfo = (res?.data?.[spaceId]?.[0] as { staked: string; era: number }) || {}
  const stakeAmount = BigInt(newestStakeInfo.staked)

  return { stakeAmount: stakeAmount.toString(), isZero: stakeAmount <= 0 }
}

type BalanceByNetworkProps = {
  account: AccountId
  network: string
}

export const getAccountBalancesByNetwork = async ({ account, network }: BalanceByNetworkProps) => {
  const res = await axiosRequest(`${subIdApiUrl}/${account}/balances/${network}`)
  return res?.data
}

const getPromoOffchainUrl = (endpoint: string) => {
  return `https://api.subsocial.network/mail${endpoint}`
}

export const getIsDomainsPromoValid = async (promoCode: string) => {
  const res = await axiosRequest(getPromoOffchainUrl(`/promo/is-active?code=${promoCode}`))
  return res?.data
}

type RegisterDomainWithPromoProps = {
  promoCode: string
  domain: string
  address: string
}
export const registerDomainWithPromoCode = async ({
  promoCode,
  domain,
  address,
}: RegisterDomainWithPromoProps) => {
  const res = await axios.post(getPromoOffchainUrl('/promo/use'), {
    promocode: promoCode,
    uname: domain,
    address,
  })
  return res?.data
}

type CreatePendingProps = {
  signer: string
  domain: string
  sellerApiAuthTokenManager: string
  createdByAccount: string
  destination: string
  target: string
}

export const createPendingOrder = async (props: CreatePendingProps) => {
  const res = await axios.post('/api/pending-order/create', props)

  return res.data
}

export const deletePendingOrder = async (domain: string, sellerApiAuthTokenManager: string) => {
  const res = await axios.post('/api/pending-order/delete', {
    domain,
    sellerApiAuthTokenManager,
  })

  return res.data
}

type UpdatePendingOrderProps = {
  domain: string
  interrupted?: boolean
  txStarted?: boolean
  sellerApiAuthTokenManager: string
}

export const updatePendingOrder = async ({
  domain,
  interrupted,
  txStarted,
  sellerApiAuthTokenManager,
}: UpdatePendingOrderProps) => {
  const res = await axios.post('/api/pending-order/update', {
    domain,
    sellerApiAuthTokenManager,
    interrupted,
    txStarted,
  })

  return res.data
}
