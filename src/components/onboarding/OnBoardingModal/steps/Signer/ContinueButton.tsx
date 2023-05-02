import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getProxyAddress } from 'src/components/utils/OffchainSigner/ExternalStorage'
import TxButton from 'src/components/utils/TxButton'

type ContinueButtonProps = {
  loading: boolean
  setLoading: (loading: boolean) => void
  onSuccess: () => void
}

const PartialContinueButton = ({ loading, setLoading, onSuccess }: ContinueButtonProps) => {
  const myAddress = useMyAddress()
  const proxyAddress = getProxyAddress(myAddress!)

  return (
    <TxButton
      isFreeTx
      type='primary'
      block
      size='large'
      className='mt-4'
      params={[proxyAddress, 'SocialActions', 0]}
      tx='freeProxy.addFreeProxy'
      onSuccess={() => {
        setLoading(false)
        onSuccess()
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

export default PartialContinueButton
