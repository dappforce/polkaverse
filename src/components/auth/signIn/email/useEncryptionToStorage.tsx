import {
  getSaltByAddress,
  getSecretKeyByAddress,
  SALT,
  SECRET_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import SignerKeyringManager from 'src/components/utils/OffchainSigner/SignerKeyringManager'
import useExternalStorage from 'src/hooks/useExternalStorage'

const signerKeyringManager = new SignerKeyringManager()

const useEncryptionToStorage = () => {
  const { setData: setSecretKey } = useExternalStorage(SECRET_KEY)
  const { setData: setSalt } = useExternalStorage(SALT)

  const getEncryptedStoredAccount = (accountAddress: string, password: string) => {
    const secretKey = getSecretKeyByAddress(accountAddress)
    const salt = getSaltByAddress(accountAddress)
    const decryptedKey = signerKeyringManager.decryptKey(secretKey!, salt!, password)

    return decryptedKey
  }

  const createEncryptedAccountAndSave = async (mnemonic: string, password: string) => {
    const { publicAddress } = await signerKeyringManager.generateAccount(mnemonic)
    const { encryptedMessage: encryptedPhrase, saltStr } = signerKeyringManager.encryptKey(
      mnemonic,
      password,
    )

    setSecretKey(encryptedPhrase, publicAddress)
    setSalt(saltStr, publicAddress)
  }

  return {
    getEncryptedStoredAccount,
    createEncryptedAccountAndSave,
  }
}

export default useEncryptionToStorage
