// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import {
  getSaltByAddress,
  getSecretKeyByAddress,
  SALT,
  SECRET_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import SignerKeyringManager from 'src/components/utils/OffchainSigner/SignerKeyringManager'
import useExternalStorage from 'src/hooks/useExternalStorage'

const signerKeyringManager = new SignerKeyringManager()

const useEncryptedStorage = () => {
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

export default useEncryptedStorage
