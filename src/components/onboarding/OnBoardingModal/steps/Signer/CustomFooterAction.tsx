import RememberMeButton from 'src/components/utils/OffchainSigner/RememberMeButton'
import ButtonGroup from './ButtonGroup'
import { SignerProps } from './Signer'

type CustomFooterActionProps = {
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  saveAsDraft: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  isPartial: boolean
  signerProps?: SignerProps
  setShowContinueBtn?: (show: boolean) => void
}

const CustomFooterAction = (props: CustomFooterActionProps) => {
  const { goToNextStep, saveAsDraft, loading, setShowContinueBtn, isPartial, signerProps } = props

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

  if (!offchainSigner) {
    if (loading) return <></>

    return (
      <RememberMeButton
        onSuccessAuth={() => {
          handleOnsuccess()
          setShowContinueBtn && setShowContinueBtn(true)
        }}
        onFailedAuth={handleOnsuccess}
      />
    )
  }

  return <></>
}

export default CustomFooterAction
