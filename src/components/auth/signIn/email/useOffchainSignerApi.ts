import { offchainSignerRequest } from 'src/components/utils/OffchainSigner/OffchainSignerUtils'

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

type AuthProps = {
  accessToken: string
  refreshToken: string
}

export type JwtPayload = {
  accountAddress: string
  accountAddressVerified: boolean
  email: string
  emailVerified: boolean
  iat: number
  exp: number
}

const useOffchainSignerApi = () => {
  const requestProof = async (accountAddress: string) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/generate-address-verification-proof',
        data: { accountAddress },
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const emailSignUp = async (props: EmailSignUpProps) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/email-sign-up',
        data: props,
      })
      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const resendEmailConfirmation = async (props: AuthProps) => {
    const { accessToken, refreshToken } = props

    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/resend-email-confirmation',
        accessToken,
        refreshToken,
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const emailSignIn = async (props: EmailSignInProps) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/email-sign-in',
        data: props,
      })
      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const confirmEmail = async (code: string, accessToken?: string, refreshToken?: string) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/confirm-email',
        data: {
          code,
        },
        accessToken,
        refreshToken,
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const getMainProxyAddress = async (props: AuthProps) => {
    const { accessToken, refreshToken } = props

    try {
      const res = await offchainSignerRequest({
        method: 'GET',
        endpoint: 'signer/main-proxy-address',
        accessToken,
        refreshToken,
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  return {
    requestProof,
    emailSignUp,
    confirmEmail,
    resendEmailConfirmation,
    emailSignIn,
    getMainProxyAddress,
  }
}

export default useOffchainSignerApi
