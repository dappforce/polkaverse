import { newLogger } from '@subsocial/utils'
import axios, { AxiosRequestConfig } from 'axios'

import { truncateAddress } from 'src/utils/storage'

const log = newLogger('OffchainSignerRequests')

import config from 'src/config'

const { offchainSignerUrl } = config

type AxiosResponse<T = any> = {
  data: T
  status: number
}

const setAuthOnRequest = (jwt: string) => {
  try {
    axios.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        config.headers = config.headers ?? {}

        config.headers.Authorization = jwt

        return config
      },
      error => {
        return Promise.reject(error)
      },
    )
  } catch (err) {
    log.error('Failed setting auth header', err)
  }
}

type SubmitSignedCallDataProps = {
  data: any
  jwt: string
}

export const isAccountOnboarded = (accountId: string) =>
  localStorage.getItem(`df.onBoardingModalFinished:${truncateAddress(accountId)}`) === '1'

export const submitSignedCallData = async ({ data, jwt }: SubmitSignedCallDataProps) => {
  const signerEndpoint: OffchainSignerEndpoint = OffchainSignerEndpoint.SIGNER_SIGN
  const method = 'POST' as Method
  const dataPayload = {
    unsigedCall: data,
  }

  try {
    const payload = {
      data: dataPayload,
      endpoint: signerEndpoint,
      method,
      jwt,
    }

    const res = offchainSignerRequest(payload)

    return res
  } catch (err) {
    log.error('Failed submitting signed call data', err)
    return Promise.reject(err)
  }
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
    setAuthOnRequest(jwt)
  }

  try {
    const res = await axios(`${offchainSignerUrl}/${endpoint}`, {
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
