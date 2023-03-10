import {
  NONCE,
  SALT,
  SALT_NONCE,
  SECRET_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { encryptKey, generateAccount } from 'src/utils/crypto'

const useEncryptionToStorage = () => {
  const { setData: setSecretKey } = useExternalStorage(SECRET_KEY)
  const { setData: setNonce } = useExternalStorage(NONCE)
  const { setData: setSalt } = useExternalStorage(SALT)
  const { setData: setSaltNonce } = useExternalStorage(SALT_NONCE)

  const createEncryptedAccountAndSave = async (mnemonic: string, password: string) => {
    const { secretKey, publicAddress } = await generateAccount(mnemonic)
    const {
      encryptedMessage: encryptedSecretKey,
      nonceStr,
      encryptedSalt,
      saltNonce,
    } = encryptKey(secretKey, password)

    setSecretKey(encryptedSecretKey, publicAddress)
    setNonce(nonceStr, publicAddress)
    setSalt(encryptedSalt, publicAddress)
    setSaltNonce(saltNonce, publicAddress)
  }

  return {
    createEncryptedAccountAndSave,
  }
}

export default useEncryptionToStorage
