import { toSubsocialAddress } from '@subsocial/utils'
import {
  PROXY_ADDRESS_KEY,
  SIGNER_EMAIL_ADDRESS_KEY,
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
  TEMP_REGISTER_ACCOUNT,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from './useExternalStorage'

type Props = {
  userAddress: string
  token: string
  refreshToken: string
}

const useSignerExternalStorage = () => {
  const { setData: setSignerToken } = useExternalStorage(SIGNER_TOKEN_KEY)
  const { setData: setSignerRefreshToken } = useExternalStorage(SIGNER_REFRESH_TOKEN_KEY)

  const { setData: setTempRegisterAccount } = useExternalStorage(TEMP_REGISTER_ACCOUNT)

  const { setData: setProxyAddress } = useExternalStorage(PROXY_ADDRESS_KEY)

  const { setData: setEmailAddress } = useExternalStorage(SIGNER_EMAIL_ADDRESS_KEY)

  const convertToSubsocialAddress = (userAddress: string) => {
    const subsocialAddress = toSubsocialAddress(userAddress)
    if (!subsocialAddress) console.warn('Unable to define subsocial address')

    return subsocialAddress
  }

  const setSignerTokensByAddress = ({ userAddress, token, refreshToken }: Props) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setSignerToken(token, subsocialAddress)
    setSignerRefreshToken(refreshToken, subsocialAddress)
  }

  const setSignerTempRegisterAccount = (userAddress: string) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setTempRegisterAccount(subsocialAddress)
  }

  const setSignerProxyAddress = (proxyAddress: string, userAddress: string) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setProxyAddress(proxyAddress, subsocialAddress)
  }

  const setSignerEmailAddress = (emailAddress: string, userAddress: string) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setEmailAddress(emailAddress, subsocialAddress)
  }

  return {
    setSignerTokensByAddress,
    setSignerTempRegisterAccount,
    setSignerProxyAddress,
    setSignerEmailAddress,
  }
}

export default useSignerExternalStorage
