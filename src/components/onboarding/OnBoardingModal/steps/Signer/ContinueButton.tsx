import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getProxyAddress } from 'src/components/utils/OffchainSigner/ExternalStorage'
import TxButton from 'src/components/utils/TxButton'

type ContinueButtonProps = {
  isRemovingProxy?: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
  onSuccess: () => void
  label?: string
}

const PartialContinueButton = ({
  loading,
  setLoading,
  onSuccess,
  isRemovingProxy,
  label,
}: ContinueButtonProps) => {
  const myAddress = useMyAddress()
  const proxyAddress = getProxyAddress(myAddress!)

  const txParams = isRemovingProxy ? undefined : [proxyAddress, 'SocialActions', 0]
  const tx = isRemovingProxy ? 'proxy.removeProxies' : 'freeProxy.addFreeProxy'

  const btnLabel = label || 'Continue'

  return (
    <TxButton
      isFreeTx
      type='primary'
      block
      size='large'
      className='mt-4'
      params={txParams}
      tx={tx}
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
      {btnLabel}
    </TxButton>
  )
}

export default PartialContinueButton
