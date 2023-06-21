// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { toSubsocialAddress } from '@subsocial/utils'
import {
  PROXY_ADDRESS_KEY,
  SIGNER_ADDRESS_KEY,
  SIGNER_EMAIL_ADDRESS_KEY,
  SIGNER_PROXY_ADDED,
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

  const { setData: setProxyAdded } = useExternalStorage(SIGNER_PROXY_ADDED, {
    parseStorageToState: data => data === '1',
    parseStateToStorage: state => (state ? '1' : undefined),
    storageKeyType: 'user',
  })

  const { setData: setSignerAddress } = useExternalStorage(SIGNER_ADDRESS_KEY, {
    parseStorageToState: data => data === '1',
    parseStateToStorage: state => (state ? '1' : undefined),
    storageKeyType: 'user',
  })

  const convertToSubsocialAddress = (userAddress: string) => {
    const subsocialAddress = toSubsocialAddress(userAddress)
    if (!subsocialAddress) console.warn('Unable to define subsocial address')

    return subsocialAddress
  }

  const setSignerTokensByAddress = ({ userAddress, token, refreshToken }: Props) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setSignerToken(token, subsocialAddress!)
    setSignerRefreshToken(refreshToken, subsocialAddress!)
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

  const setSignerProxyAdded = (state: 'enabled' | 'disabled', userAddress: string) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    const data = state === 'enabled' ? true : undefined
    setProxyAdded(data, subsocialAddress)
  }

  const setIsSignerAddress = (userAddress: string) => {
    const subsocialAddress = convertToSubsocialAddress(userAddress)
    setSignerAddress(true, subsocialAddress)
  }

  return {
    setSignerTokensByAddress,
    setSignerTempRegisterAccount,
    setSignerProxyAddress,
    setSignerEmailAddress,
    setSignerProxyAdded,
    setIsSignerAddress,
  }
}

export default useSignerExternalStorage
