import { randomAsNumber } from '@polkadot/util-crypto'
import {
  SocialRemark,
  SocialRemarkDestChainsNameId,
  SocialRemarkMessageVersion,
  SubSclSource,
} from '@subsocial/utils'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import LazyTxButton from 'src/components/donate/LazyTxButton'
import { useLazyConnectionsContext } from 'src/components/lazy-connection/LazyConnectionContext'
import { createPendingOrder } from 'src/components/utils/OffchainUtils'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useManageDomainContext } from '../manage/ManageDomainProvider'
import { domainsNetwork, validDomainPrice } from './config'

type BuyByDotTxButtonProps = {
  domainName: string
  className?: string
  close: () => void
}

function getKeyName(value: string) {
  return Object.entries(SocialRemarkDestChainsNameId).find(([key]) => key === value)?.[1]
}

const BuyByDotTxButton = ({ domainName, className, close }: BuyByDotTxButtonProps) => {
  const { recipient, purchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()

  const { getApiByNetwork } = useLazyConnectionsContext()

  const getParams = async () => {
    if (!purchaser || !sellerConfig) return []

    const {
      remarkProtName,
      sellerTreasuryAccount,
      remarkProtVersion,
      domainHostChain,
      sellerToken: { name: tokenName },
    } = sellerConfig

    const api = await getApiByNetwork(domainsNetwork)

    if (!api) return []

    const transferTx = api.tx.balances.transfer(sellerTreasuryAccount, validDomainPrice)

    SocialRemark.setConfig({ protNames: [remarkProtName] })

    const destination = getKeyName(domainHostChain)

    if (!destination) return []

    const regRmrkMsg: SubSclSource<'DMN_REG'> = {
      protName: remarkProtName,
      action: 'DMN_REG',
      version: remarkProtVersion as SocialRemarkMessageVersion,
      destination,
      content: {
        opId: `${transferTx.hash.toHex()}-${randomAsNumber()}`,
        domainName,
        target: recipient,
        token: tokenName,
      },
    }

    const remarkTx = api.tx.system.remark(new SocialRemark().fromSource(regRmrkMsg).toMessage())

    return [[transferTx, remarkTx]]
  }

  const onSuccess = () => {
    console.log('Extrinsic Success')
    close()
  }

  const onFailed = () => {
    console.log('Extrinsic failed')
  }

  const onClick = async () => {
    if(!sellerConfig) return

    const { sellerApiAuthTokenManager } = sellerConfig

    const result = await createPendingOrder(purchaser, domainName, sellerApiAuthTokenManager)
    console.log(result)
    dispatch(fetchPendingOrdersByAccount({ id: myAddress || '', reload: true }))
  }

  return (
    <LazyTxButton
      block
      type='primary'
      size='middle'
      network={domainsNetwork}
      accountId={purchaser}
      disabled={!recipient}
      tx={'utility.batchAll'}
      params={getParams}
      onSuccess={onSuccess}
      onFailed={onFailed}
      onClick={() => onClick()}
      label={'Register'}
      className={className}
    />
  )
}

export default BuyByDotTxButton
