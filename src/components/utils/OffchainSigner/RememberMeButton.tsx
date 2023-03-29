import { isFunction } from '@polkadot/util'
import Button from 'antd/lib/button'
import React, { useEffect, useRef, useState } from 'react'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'

import { addressSignIn, fetchMainProxyAddress, requestProof } from './api/requests'
import { setAuthOnRequest } from './api/utils'

import HCaptcha from '@hcaptcha/react-hcaptcha'
import type { Signer } from '@polkadot/api/types'
import { stringToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getCurrentWallet } from 'src/components/auth/utils'
import { useResponsiveSize } from 'src/components/responsive'
import { useSubstrate } from 'src/components/substrate'
import useToggle from 'src/components/substrate/useToggle'
import { getWalletBySource } from 'src/components/wallets/supportedWallets'
import { hCaptchaSiteKey } from 'src/config/env'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { showErrorMessage } from '../Message'
import { PROXY_ADDRESS_KEY, SIGNER_REFRESH_TOKEN_KEY, SIGNER_TOKEN_KEY } from './ExternalStorage'
const log = newLogger('RememberMeButton')

interface RememberMeButtonProps extends TxButtonProps {
  onFailedAuth: () => void
  onSuccessAuth: () => void
}

function RememberMeButton({
  label,
  disabled,
  loading,
  onClick,
  onSuccessAuth,
  onFailedAuth,
  withSpinner,
  component,
  ...antdProps
}: RememberMeButtonProps) {
  const { api } = useSubstrate()
  const [isConfirming, , setIsConfirming] = useToggle(false)
  const { isMobile } = useResponsiveSize()
  const myAddress = useMyAddress()

  const { setData: setSignerToken } = useExternalStorage(SIGNER_TOKEN_KEY)
  const { setData: setSignerRefreshToken } = useExternalStorage(SIGNER_REFRESH_TOKEN_KEY)
  const { setData: setProxyAddress } = useExternalStorage(PROXY_ADDRESS_KEY)

  const [token, setToken] = useState<string | undefined>()
  const [captchaReady, setCaptchaReady] = useState(false)
  const hCaptchaRef = useRef(null)

  useEffect(() => {
    if (token) {
      confirmOffchainSigner(token)
    }
  }, [token])

  const onExpire = () => {
    console.warn('hCaptcha Token Expired')
  }

  const onError = (err: any) => {
    console.warn(`hCaptcha Error: ${err}`)
  }

  const onLoad = () => {
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hCaptchaRef.current?.execute()
  }

  useEffect(() => {
    setCaptchaReady(true)
  }, [])

  const confirmOffchainSigner = (token: string) => {
    isFunction(onClick) && onClick()

    setIsConfirming(true)
    finaliseOffchainSigner(token)
  }

  const buttonLabel = label || 'Remember me'
  const Component = component || Button

  if (!api || !api.isReady) {
    return (
      <Component {...antdProps} disabled={true}>
        {buttonLabel}
      </Component>
    )
  }

  const onFailedHandler = (err: Error) => {
    if (err) {
      setToken(undefined)
      onFailedAuth()
      setIsConfirming(false)
      const errMsg = `Signing failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)
      showErrorMessage(errMsg)
    }
  }

  const signMessage = async (messageJwt: string): Promise<`0x${string}` | undefined> => {
    if (!myAddress) {
      throw new Error('No account id provided')
    }

    let signer: Signer | undefined

    if (isMobile) {
      const { web3FromAddress } = await import('@polkadot/extension-dapp')
      signer = await (await web3FromAddress(myAddress.toString())).signer
    } else {
      const currentWallet = getCurrentWallet()
      const wallet = getWalletBySource(currentWallet)
      signer = wallet?.signer
    }

    if (!signer) {
      throw new Error('No signer provided')
    }

    if (!signer?.signRaw) {
      throw new Error('signing failed!')
    }

    try {
      const { signature } = await signer.signRaw({
        address: myAddress as string,
        data: stringToHex(messageJwt),
        type: 'bytes',
      })

      return signature
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const finaliseOffchainSigner = async (hcaptchaResponse: string) => {
    if (!myAddress) {
      throw new Error('No account id provided')
    }

    try {
      const dataMessage = await requestProof(myAddress)
      const { jwt: proof } = dataMessage

      const signedProof = await signMessage(proof)

      if (!signedProof) {
        console.warn('Error when generating signed')
        return
      }

      const props = {
        proof,
        signedProof,
        hcaptchaResponse,
      }

      const dataSignature = await addressSignIn(props)
      const { accessToken, refreshToken } = dataSignature

      setAuthOnRequest(accessToken)

      setSignerToken(accessToken, myAddress)
      setSignerRefreshToken(refreshToken, myAddress)

      const { address: mainProxyAddress } = await fetchMainProxyAddress(accessToken)
      setProxyAddress(mainProxyAddress, myAddress)
      onSuccessAuth()
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const isDisabled = disabled || isConfirming || !captchaReady

  return (
    <>
      <Component
        {...antdProps}
        onClick={() => {
          onLoad()
        }}
        disabled={isDisabled}
        loading={(withSpinner && isConfirming) || loading}
      >
        {buttonLabel}
      </Component>
      <HCaptcha
        size='invisible'
        sitekey={hCaptchaSiteKey}
        onVerify={setToken}
        onLoad={() => {
          setCaptchaReady(true)
        }}
        onError={onError}
        onExpire={onExpire}
        ref={hCaptchaRef}
      />
    </>
  )
}

export default React.memo(RememberMeButton)
