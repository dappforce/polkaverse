import ButtonGroup from './ButtonGroup'
import ContinueButton from './ContinueButton'
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

  if (!offchainSigner) {
    if (loading) return <></>

    return (
      <ContinueButton
        goToNextStep={goToNextStep}
        loading={false}
        setLoading={setLoading}
        isPartial={isPartial}
      />
    )
  }

  return <></>
}

export default CustomFooterAction
