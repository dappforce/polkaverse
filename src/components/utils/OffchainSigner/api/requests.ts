import { isFunction } from '@polkadot/util'
import { OffchainSignerEndpoint, sendHttpRequest, SendHttpRequestProps } from './utils'

type EmailSignUpProps = {
  email: string
  password: string
  accountAddress: string
  signedProof: string
  proof: string
  hcaptchaResponse: string
}

type EmailSignInProps = {
  email: string
  password: string
  hcaptchaResponse: string
}

type AddressSignInProps = {
  signedProof: string
  proof: string
  hcaptchaResponse: string
}

type ConfirmEmailProps = {
  code: string
  accessToken: string
}

export type JwtPayload = {
  accountAddress: string
  accountAddressVerified: boolean
  email: string
  emailVerified: boolean
  iat: number
  exp: number
}

export const requestProof = async (
  accountAddress: string,
  onFailedCallback?: (err: Error) => void,
) => {
  const data = {
    accountAddress,
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

export const addressSignIn = async (
  props: AddressSignInProps,
  onFailedCallback: (err: Error) => void,
) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.ADDRESS_SIGN_IN,
      data: props,
    },
    method: 'POST',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to sign in with address')),
    onFailedText: 'Failed to sign in with address',
  })

  return res
}

export const emailSignUp = async (
  props: EmailSignUpProps,
  onFailedCallback: (err: Error) => void,
) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.SIGNUP,
      data: props,
    },
    method: 'POST',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to sign up with email')),
    onFailedText: 'Failed to sign up with email',
  })

  return res
}

export const confirmEmail = async (props: ConfirmEmailProps) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.CONFIRM,
      data: props.code,
      config: {
        headers: {
          Authorization: props.accessToken,
        },
      },
    },
    method: 'POST',
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to confirm email',
  })

  return res
}

export const resendEmailConfirmation = async (accessToken: string) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.RESEND_CONFIRMATION,
      config: {
        headers: {
          Authorization: accessToken,
        },
      },
    },
    method: 'POST',
    onFaileReturnedValue: undefined,
    onFailedText: 'Failed to resend email confirmation',
  })

  return res
}

export const emailSignIn = async (
  props: EmailSignInProps,
  onFailedCallback: (err: Error) => void,
) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.SIGNIN,
      data: props,
    },
    method: 'POST',
    onFaileReturnedValue:
      isFunction(onFailedCallback) && onFailedCallback(new Error('Failed to sign in with email')),
    onFailedText: 'Failed to sign in with email',
  })

  return res
}

export const fetchMainProxyAddress = async (
  accessToken: string,
  onFailedCallback?: (err: Error) => void,
) => {
  const res = await sendHttpRequest({
    params: {
      url: OffchainSignerEndpoint.FETCH_MAIN_PROXY,
      config: {
        headers: {
          Authorization: accessToken,
        },
      },
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
