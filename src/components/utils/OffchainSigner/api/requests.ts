import { isFunction } from '@polkadot/util'
import { OffchainSignerEndpoint, sendHttpRequest, SendHttpRequestProps } from './utils'

export const requestMessage = async (
  myAddress: string,
  onFailedCallback?: (err: Error) => void,
) => {
  if (!myAddress) {
    throw new Error('No account id provided')
  }

  const data = {
    accountAddress: myAddress,
  }

  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.GENERATE_PROOF,
      data,
    },
    method: 'POST',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to generate proof')),
    onFailedText: 'Failed to generate proof',
  })

  return res
}

export const sendSignedMessage = async (
  myAddress: string,
  signedMessageJwt: string,
  messageJwt: string,
  token: string,
  onFailedCallback: (err: Error) => void,
) => {
  if (!token) throw new Error('Please confirm hCaptcha!')

  const data = {
    accountAddress: myAddress as string,
    signedMessageJwt,
    messageJwt,
    hcaptchaResponse: token,
  }

  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.SEND_SIGNED_PROOF,
      data,
    },
    method: 'POST',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to send signed proof')),
    onFailedText: 'Failed to send signed proof',
  })

  return res
}

export const fetchProxyAddress = async (onFailedCallback?: (err: Error) => void) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.FETCH_MAIN_PROXY,
    },
    method: 'GET',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to fetch proxy address')),
    onFailedText: 'Failed to fetch proxy address',
  })

  return res
}

type SubmitSignedCallDataProps = {
  data: string
  jwt: string
}

export const submitSignedCallData = async ({ data, jwt }: SubmitSignedCallDataProps) => {
  const payload: SendHttpRequestProps = {
    params: {
      url: OffchainSignerEndpoint.SIGNER_SIGN,
      data: {
        unsigedCall: data,
      },
    },
    method: 'POST',
    accessToken: jwt,
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed submitting signed call data',
  }

  const res = sendHttpRequest(payload)

  return res
}
