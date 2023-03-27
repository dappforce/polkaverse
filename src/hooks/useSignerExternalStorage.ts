import {
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

  const setSignerTokensByAddress = ({ userAddress, token, refreshToken }: Props) => {
    setSignerToken(token, userAddress)
    setSignerRefreshToken(refreshToken, userAddress)
  }

  const setSignerTempRegisterAccount = (userAddress: string) => {
    setTempRegisterAccount(userAddress)
  }

  const setSignerProxyAddress = (proxyAddress: string, userAddress: string) => {
    setSignerProxyAddress(proxyAddress, userAddress)
  }

  return { setSignerTokensByAddress, setSignerTempRegisterAccount, setSignerProxyAddress }
}

export default useSignerExternalStorage
