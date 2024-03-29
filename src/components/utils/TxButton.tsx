import { newLogger } from '@subsocial/utils'
import AntdButton from 'antd/lib/button'
import { useMyAccount } from 'src/stores/my-account'

import { isClientSide } from '.'
import SubstrateTxButton, { TxButtonProps } from '../substrate/SubstrateTxButton'
import { useStorybookContext } from './StorybookContext'

const log = newLogger('TxButton')

const mockSendTx = () => {
  const msg = 'Cannot send a Substrate tx in a mock mode (e.g. in Stoorybook)'
  if (isClientSide()) {
    window.alert(`WARN: ${msg}`)
  } else {
    log.warn(msg)
  }
}

function ResolvedTxButton({ canUseProxy = true, ...props }: TxButtonProps) {
  const { isStorybook = false } = useStorybookContext()
  const parentProxyAddress = useMyAccount(state => state.parentProxyAddress)
  const address = useMyAccount(state => state.address)
  let usedAddress = props.accountId || address || ''
  if (props.accountId === parentProxyAddress && canUseProxy) {
    usedAddress = address || ''
  } else if (!canUseProxy) {
    usedAddress = parentProxyAddress || address || ''
  }

  return isStorybook ? (
    <AntdButton {...props} onClick={mockSendTx} />
  ) : (
    <SubstrateTxButton
      {...props}
      canUseProxy={canUseProxy}
      accountId={usedAddress}
      parentProxyAddress={usedAddress === address ? parentProxyAddress : undefined}
    />
  )
}

export default ResolvedTxButton
