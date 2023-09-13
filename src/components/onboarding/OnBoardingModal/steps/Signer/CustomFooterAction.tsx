import { VoidFn } from '@polkadot/api/types'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useIsProxyAddedContext } from 'src/components/onboarding/contexts/IsProxyAdded'
import RememberMeButton from 'src/components/utils/OffchainSigner/RememberMeButton'
import { useAppDispatch } from 'src/rtk/app/store'
import { useCurrentOnBoardingStep } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { resetOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingSlice'
import ButtonGroup from './ButtonGroup'
import PartialContinueButton from './ContinueButton'
import { SignerProps } from './Signer'

type CustomFooterActionProps = {
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  saveAsDraft: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  isPartial: boolean
  signerProps?: SignerProps
}

const CustomFooterAction = (props: CustomFooterActionProps) => {
  const [isShowContinueBtn, setShowContinueBtn] = useState(false)
  const dispatch = useAppDispatch()
  const currentStep = useCurrentOnBoardingStep()
  const { goToNextStep, saveAsDraft, loading, setLoading, isPartial, signerProps } = props
  const { setIsProxyAdded } = useIsProxyAddedContext()

  const myAddress = useMyAddress()

  const [isProxyAddedOnChain, setIsProxyAddedOnChain] = useState(false)
  const [isLoadingCheckProxyOnChain, setLoadingCheckProxyOnChain] = useState(false)

  useSubsocialEffect(
    ({ substrate }) => {
      setLoadingCheckProxyOnChain(false)
      if (!myAddress) return

      let unsubFreeProxy: VoidFn | undefined

      const subFreeProxy = async () => {
        const api = await substrate.api

        unsubFreeProxy = await api.query.proxy.proxies(myAddress, async proxiedEntities => {
          const proxyAddresses = proxiedEntities.map(proxy => proxy.toHuman() as string)
          if (proxyAddresses.length > 0) {
            setIsProxyAddedOnChain(true)
          } else {
            setIsProxyAddedOnChain(false)
          }
        })

        setLoadingCheckProxyOnChain(false)
      }

      subFreeProxy()

      return () => {
        unsubFreeProxy && unsubFreeProxy()
      }
    },
    [myAddress],
  )

  const executeOnSuccess = () => {
    handleOnsuccess()
    goToNextStep({ forceTerminateFlow: true })
    dispatch(resetOnBoardingData(currentStep))
    setIsProxyAdded(true)
    return
  }

  if (!signerProps) return <></>

  const { offchainSigner, loadingProxy, setLoadingProxy, handleOnsuccess } = signerProps

  if (!isPartial) {
    return (
      <ButtonGroup
        goToNextStep={goToNextStep}
        saveAsDraft={saveAsDraft}
        loadingProxy={loadingProxy}
        setLoadingProxy={setLoadingProxy}
        offchainSigner={offchainSigner}
        onSuccess={handleOnsuccess}
      />
    )
  }

  if (!offchainSigner && loading) return <></>

  if (isShowContinueBtn) {
    return (
      <PartialContinueButton
        loading={loading}
        setLoading={setLoading}
        onSuccess={() => {
          executeOnSuccess()
        }}
      />
    )
  }

  return (
    <RememberMeButton
      loading={isLoadingCheckProxyOnChain}
      onSuccessAuth={() => {
        if (!isProxyAddedOnChain) {
          setShowContinueBtn && setShowContinueBtn(true)
        } else {
          executeOnSuccess()
        }
      }}
      onFailedAuth={handleOnsuccess}
    />
  )
}

export default CustomFooterAction
