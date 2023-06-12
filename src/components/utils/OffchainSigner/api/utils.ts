import { newLogger } from '@subsocial/utils'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import config from 'src/config'
import offchainSignerApi from './axios'
const { offchainSignerUrl } = config

const log = newLogger('OffchainSignerRequests')

export const OffchainSignerEndpoint = {
  GENERATE_PROOF: 'auth/generate-address-verification-proof',
  ADDRESS_SIGN_IN: 'auth/address-sign-in',
  REFRESH_TOKEN: 'auth/refresh-token',
  REVOKE_TOKEN: 'auth/revoke-token',
  SIGNUP: 'auth/email-sign-up',
  SIGNIN: 'auth/email-sign-in',
  CONFIRM: 'auth/confirm-email',
  RESEND_CONFIRMATION: 'auth/resend-email-confirmation',
  SIGNER_SIGN: 'signer/sign',
  FETCH_MAIN_PROXY: 'signer/main-proxy-address',
} as const

export const getBackendUrl = (paramsUrl: string) => {
  return `${offchainSignerUrl}/${paramsUrl}`
}

export type OffchainSignerEndpoint =
  (typeof OffchainSignerEndpoint)[keyof typeof OffchainSignerEndpoint]

export type Method = 'GET' | 'POST'

export const setAuthOnRequest = (accessToken: string) => {
  try {
    axios.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        config.headers = config.headers ?? {}

        config.headers = {
          Authorization: accessToken,
        }

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

type SendRequestProps = {
  request: () => Promise<AxiosResponse<any, any>>
  onFailedText: string
  onFaileReturnedValue?: any
}

type WrappedRequestProps = {
  backEndUrl: string
  method: Method
  config: any
  data?: any
  accessToken?: string
  refreshToken?: string
}

const wrappedRequest = ({ backEndUrl, method, config, data }: WrappedRequestProps) => {
  const requestConfig: AxiosRequestConfig<any> = {
    baseURL: backEndUrl,
    method,
    data: data ?? undefined,
    ...config,
  }
  return offchainSignerApi().request(requestConfig)
}

export const sendRequest = async ({ request, onFailedText }: SendRequestProps) => {
  try {
    const res = await request()
    if (!res.status.toString().startsWith('2')) {
      log.warn(onFailedText)
    }

    return res.data
  } catch (err) {
    return Promise.reject(err)
  }
}

type GetParams = {
  url: string
  data?: any
  config?: any
}

export type SendHttpRequestProps = {
  params: GetParams
  onFaileReturnedValue: any
  onFailedText: string
  method: Method
  accessToken?: string
  refreshToken?: string
}

export const sendHttpRequest = ({
  params: { url, data, config },
  method,
  accessToken,
  ...props
}: SendHttpRequestProps) => {
  const newConfig = {
    ...config,
    headers: {
      Authorization: accessToken!,
    },
  }
  if (url === OffchainSignerEndpoint.REFRESH_TOKEN) {
    return sendRequest({
      request: () =>
        wrappedRequest({
          backEndUrl: getBackendUrl(url),
          data,
          method,
          config: newConfig,
        }),
      ...props,
    })
  }

  switch (method) {
    case 'GET': {
      return sendRequest({
        request: () =>
          wrappedRequest({
            backEndUrl: getBackendUrl(url),
            method,
            config: newConfig,
          }),
        ...props,
      })
    }
    case 'POST': {
      return sendRequest({
        request: () =>
          wrappedRequest({
            backEndUrl: getBackendUrl(url),
            method,
            config: newConfig,
            data,
          }),
        ...props,
      })
    }
    default: {
      return
    }
  }
}
