import { newLogger } from '@subsocial/utils'
import axios from 'axios'

const log = newLogger('OffchainSignerRequests')

const OFFCHAIN_SIGNER_URL = 'http://127.0.0.1:3000'

type AxiosResponse<T = any> = {
  data: T
  status: number
}

export const OffchainSignerEndpoint = {
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  CONFIRM: '/auth/confirm-email',
  SIGNER_SIGN: '/signer/sign',
} as const

export type OffchainSignerEndpoint =
  typeof OffchainSignerEndpoint[keyof typeof OffchainSignerEndpoint]

export const offchainSignerRequest = async (
  data: any,
  endpoint: OffchainSignerEndpoint,
  jwt?: string,
): Promise<AxiosResponse | undefined> => {
  let headers: undefined | { Authorization: string }
  if (jwt) {
    headers = { Authorization: jwt }
  }

  try {
    const res = await axios(`${OFFCHAIN_SIGNER_URL}/${endpoint}`, {
      method: 'POST',
      data,
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
