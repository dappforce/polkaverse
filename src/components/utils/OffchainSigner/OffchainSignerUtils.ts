import { newLogger } from '@subsocial/utils'
import axios from 'axios'

const log = newLogger('OffchainSignerRequests')

const OFFCHAIN_SIGNER_URL = 'https://staging-signer.subsocial.network'

type AxiosResponse<T = any> = {
  data: T
  status: number
}

export const OffchainSignerEndpoint = {
  SIGNUP: 'auth/signup',
  SIGNIN: 'auth/signin',
  CONFIRM: 'auth/confirm-email',
  SIGNER_SIGN: 'signer/sign',
  GENERATE_PROOF: 'auth/generateAuthByAddressProof',
  SEND_SIGNED_PROOF: 'auth/authByAddress',
  FETCH_MAIN_PROXY: 'signer/main-proxy-address',
} as const

export type OffchainSignerEndpoint =
  typeof OffchainSignerEndpoint[keyof typeof OffchainSignerEndpoint]

export type Method = 'GET' | 'POST'

type OffchainSignerRequestProps = {
  endpoint: OffchainSignerEndpoint
  method: Method
  data?: any
  jwt?: string
}

export const offchainSignerRequest = async (
  props: OffchainSignerRequestProps,
): Promise<AxiosResponse | undefined> => {
  const { data, endpoint, method, jwt } = props

  let headers: undefined | { Authorization: string }
  if (jwt) {
    headers = { Authorization: jwt }
  }

  try {
    const res = await axios(`${OFFCHAIN_SIGNER_URL}/${endpoint}`, {
      method,
      data: method === 'GET' ? undefined : data,
      headers,
    })

    if (res.status !== 200) {
      log.error('Failed request to offchain signer with status', res.status)
    }

    return res
  } catch (error) {
    log.error('Failed request to offchain signer with error', error)
    return undefined
  }
}
