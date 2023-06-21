// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useEffect, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import {
  isCurrentSignerAddress,
  SIGNER_TOKEN_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useSaveOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../../types'

export type SignerProps = {
  loadingProxy: boolean
  setLoadingProxy: (loadingProxy: boolean) => void
  offchainSigner: boolean
  handleOnsuccess: () => void
}

export default function Signer(props: OnBoardingContentProps) {
  const setProxySuccessMessage = useSaveOnBoardingData('signer')

  const [loadingProxy, setLoadingProxy] = useState(false)
  const [offchainSigner, setOffchainSigner] = useState(false)

  const { data: signerToken } = useExternalStorage(SIGNER_TOKEN_KEY, {
    storageKeyType: 'user',
  })

  const myAddress = useMyAddress()

  const isSignerAddress = isCurrentSignerAddress(myAddress!)

  useEffect(() => {
    if (isSignerAddress && typeof signerToken === 'string' && signerToken.length > 0) {
      setOffchainSigner(true)
    }
  }, [isSignerAddress])

  const handleOnsuccess = () => {
    setOffchainSigner(true)
    setProxySuccessMessage('Remembering you')
  }

  return (
    <OnBoardingContentContainer
      {...props}
      isUsingCustomFooter={true}
      signerProps={{
        loadingProxy,
        setLoadingProxy,
        handleOnsuccess,
        offchainSigner,
      }}
    >
      <img className='on-boarding-confirmationless-image' src='/images/onboarding/no-confirm.png' />
    </OnBoardingContentContainer>
  )
}
