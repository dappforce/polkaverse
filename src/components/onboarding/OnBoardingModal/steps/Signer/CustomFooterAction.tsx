import { useState } from 'react'
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
          handleOnsuccess()
          goToNextStep({ forceTerminateFlow: true })
          dispatch(resetOnBoardingData(currentStep))
          return
        }}
      />
    )
  }

  return (
    <RememberMeButton
      onSuccessAuth={() => {
        setShowContinueBtn && setShowContinueBtn(true)
      }}
      onFailedAuth={handleOnsuccess}
    />
  )
}

export default CustomFooterAction
