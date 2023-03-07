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

type AuthProps = {
  accessToken: string
  refreshToken: string
}

export const setAuthOnRequest = (props: AuthProps) => {
  try {
    axios.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        config.headers = config.headers ?? {}

        config.headers.Authorization = props.accessToken

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
  EMAIL_SIGN_IN: 'auth/email-sign-in',
  EMAIL_SIGN_UP: 'auth/email-sign-up',
  GENERATE_PROOF: 'auth/generate-address-verification-proof',
  ADDRESS_SIGN_IN: 'auth/address-sign-in',
  CONFIRM_EMAIL: 'auth/confirm-email',
  RESEND_EMAIL_CONFIRMATION: 'auth/resend-email-confirmation',
  REFRESH_TOKEN: 'auth/refresh-token',
  REVOKE_TOKEN: 'auth/revoke-token',
  FETCH_MAIN_PROXY: 'signer/main-proxy-address',
  SIGNER_SIGN: 'signer/sign',
} as const

export type OffchainSignerEndpoint =
  typeof OffchainSignerEndpoint[keyof typeof OffchainSignerEndpoint]

export type Method = 'GET' | 'POST'

type OffchainSignerRequestProps = {
  endpoint: OffchainSignerEndpoint
  method: Method
  data?: any
  accessToken?: string
  refreshToken?: string
}

export const offchainSignerRequest = async (
  props: OffchainSignerRequestProps,
): Promise<AxiosResponse | undefined> => {
  const { data, endpoint, method, accessToken, refreshToken } = props

  let headers: undefined | { Authorization: string }
  if (accessToken && refreshToken) {
    headers = {
      Authorization: accessToken,
    }
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
