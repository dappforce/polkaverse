import { Button } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import {
  getProxyAddress,
  isCurrentOffchainAddress,
  OFFCHAIN_TOKEN_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import RememberMeButton from 'src/components/utils/OffchainSigner/RememberMeButton'
import TxButton from 'src/components/utils/TxButton'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useSaveOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../OnBoardingContentContainer'
import { CustomContinueButtonGroupProps, OnBoardingContentProps } from '../types'

type ContinueBtnProps = {
  proxyAddress: string
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  isPartial?: boolean
}

type ButtonGroupProps = {
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  loadingProxy: boolean
  setLoadingProxy: (loadingProxy: boolean) => void
  saveAsDraft: () => void
  proxyAdded: boolean
  offchainSigner: boolean
  onSuccess: () => void
  isPartial?: boolean
}

const ContinueBtn = ({
  proxyAddress,
  isPartial,
  loading,
  setLoading,
  goToNextStep,
}: ContinueBtnProps) => {
  return (
    <TxButton
      isFreeTx
      type='primary'
      block
      size='large'
      className='mt-4'
      params={[proxyAddress, 'Any', 0]}
      tx='proxy.addProxy'
      onSuccess={() => {
        setLoading(false)
        if (isPartial) {
          goToNextStep({ forceTerminateFlow: true })
          return
        }
      }}
      onFailed={() => setLoading(false)}
      loading={loading}
      disabled={loading}
      onValidate={async () => {
        return true
      }}
      onClick={async () => {
        setLoading(true)
      }}
    >
      Continue
    </TxButton>
  )
}

const ButtonGroup = ({
  isPartial,
  goToNextStep,
  loadingProxy,
  setLoadingProxy,
  saveAsDraft,
  proxyAdded,
  offchainSigner,
  onSuccess,
}: ButtonGroupProps) => {
  return (
    <>
      <div className={clsx('DfButtonGroupRoot mt-4')}>
        <Button
          className={clsx('w-100')}
          size='large'
          onClick={() => {
            goToNextStep()
          }}
        >
          No, I’m fine
        </Button>
        <RememberMeButton
          className={clsx('w-100')}
          type='primary'
          size='large'
          withSpinner={true}
          loading={loadingProxy}
          disabled={loadingProxy}
          onClick={() => {
            setLoadingProxy(true)

            saveAsDraft()
            if (proxyAdded && offchainSigner) {
              goToNextStep()
            } else {
              setLoadingProxy(false)
            }
          }}
          onFailedAuth={() => setLoadingProxy(false)}
          onSuccessAuth={() => {
            setLoadingProxy(false)
            onSuccess()
            if (!isPartial) goToNextStep()
          }}
        />
      </div>
    </>
  )
}

export default function Signer(props: OnBoardingContentProps) {
  const setProxySuccessMessage = useSaveOnBoardingData('signer')

  const [loadingProxy, setLoadingProxy] = useState(false)
  const [proxyAdded, setProxyAdded] = useState(false)
  const [offchainSigner, setOffchainSigner] = useState(false)

  const { data: offchainToken } = useExternalStorage(OFFCHAIN_TOKEN_KEY, {
    storageKeyType: 'user',
  })

  const myAddress = useMyAddress()

  const proxyAddress = getProxyAddress(myAddress!)
  const isOffchainAddress = isCurrentOffchainAddress(myAddress!)

  useEffect(() => {
    if (proxyAddress) {
      setProxyAdded(true)
    }
    if (isOffchainAddress && typeof offchainToken === 'string' && offchainToken.length > 0) {
      setOffchainSigner(true)
    }
  }, [proxyAddress, isOffchainAddress])

  const handleOnsuccess = () => {
    setProxyAdded(true)
    setOffchainSigner(true)
    setProxySuccessMessage('Remembering you')
  }

  return (
    <OnBoardingContentContainer
      {...props}
      customContinueButtonGroup={(buttonProps: CustomContinueButtonGroupProps) =>
        buttonProps.isPartial ? (
          !proxyAdded && !offchainSigner ? (
            <ButtonGroup
              goToNextStep={props.goToNextStep}
              loadingProxy={loadingProxy}
              setLoadingProxy={setLoadingProxy}
              proxyAdded={proxyAdded}
              offchainSigner={offchainSigner}
              onSuccess={handleOnsuccess}
              {...buttonProps}
            />
          ) : !props.loading ? (
            <ContinueBtn
              proxyAddress={proxyAddress!}
              goToNextStep={props.goToNextStep}
              loading={false}
              setLoading={props.setLoading}
              isPartial={buttonProps.isPartial}
            />
          ) : (
            <></>
          )
        ) : (
          <ButtonGroup
            goToNextStep={props.goToNextStep}
            loadingProxy={loadingProxy}
            setLoadingProxy={setLoadingProxy}
            proxyAdded={proxyAdded}
            offchainSigner={offchainSigner}
            onSuccess={handleOnsuccess}
            {...buttonProps}
          />
        )
      }
    >
      <img className='on-boarding-confirmationless-image' src='/images/onboarding/no-confirm.png' />
    </OnBoardingContentContainer>
  )
}
