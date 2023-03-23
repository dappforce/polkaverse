import {
  getSaltByAddress,
  getSecretKeyByAddress,
  SALT,
  SECRET_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { decryptKey, encryptKey, generateAccount } from 'src/utils/crypto'

const useEncryptionToStorage = () => {
  const { setData: setSecretKey } = useExternalStorage(SECRET_KEY)
  const { setData: setSalt } = useExternalStorage(SALT)

  const getEncryptedStoredAccount = (accountAddress: string, password: string) => {
    const secretKey = getSecretKeyByAddress(accountAddress)
    const salt = getSaltByAddress(accountAddress)
    const decryptedKey = decryptKey(secretKey!, salt!, password)

    return decryptedKey
  }

  const createEncryptedAccountAndSave = async (mnemonic: string, password: string) => {
    const { publicAddress } = await generateAccount(mnemonic)
    const { encryptedMessage: encryptedPhrase, saltStr } = encryptKey(mnemonic, password)

    setSecretKey(encryptedPhrase, publicAddress)
    setSalt(saltStr, publicAddress)
  }

  return {
    getEncryptedStoredAccount,
    createEncryptedAccountAndSave,
  }
}

export default useEncryptionToStorage
