import { randomAsNumber } from '@polkadot/util-crypto'
import {
  SocialRemark,
  SocialRemarkDestChainsNameId,
  SocialRemarkMessageVersion,
  SubSclSource,
} from '@subsocial/utils'
import BN from 'bignumber.js'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'
import LazyTxButton from 'src/components/donate/LazyTxButton'
import { useLazyConnectionsContext } from 'src/components/lazy-connection/LazyConnectionContext'
import { createPendingOrder, deletePendingOrder } from 'src/components/utils/OffchainUtils'
import { useAppDispatch } from 'src/rtk/app/store'
import { useSelectPendingOrderById } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useManageDomainContext } from '../manage/ManageDomainProvider'
import { pendingOrderAction, useGetDecimalAndSymbol } from './utils'
import { useCreateReloadProcessingOrdersByAccount } from 'src/rtk/features/processingRegistrationOrders/processingRegistratoinOrdersHooks'

type BuyByDotTxButtonProps = {
  domainName: string
  className?: string
  close: () => void
}

function getKeyName(value: string) {
  return Object.entries(SocialRemarkDestChainsNameId).find(([key]) => key === value)?.[1]
}

const BuyByDotTxButton = ({ domainName, className, close }: BuyByDotTxButtonProps) => {
  const { recipient, purchaser, setIsFetchNewDomains, setProcessingDomains } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const { getApiByNetwork } = useLazyConnectionsContext()
  const pendingOrder = useSelectPendingOrderById(domainName)
  const reloadProcessingOrders = useCreateReloadProcessingOrdersByAccount()

  const { sellerChain, domainRegistrationPriceFixed } = sellerConfig || {}

  const { symbol } = useGetDecimalAndSymbol(sellerChain)

  const balance = useBalancesByNetwork({
    account: purchaser,
    network: sellerChain,
    currency: symbol,
  })

  const { freeBalance } = balance || {}

  const getParams = async () => {
    if (!purchaser || !sellerConfig) return []

    const {
      remarkProtName,
      sellerTreasuryAccount,
      remarkProtVersion,
      domainHostChain,
      domainRegistrationPriceFixed,
      sellerToken: { name: tokenName },
      sellerChain,
    } = sellerConfig

    const api = await getApiByNetwork(sellerChain)

    if (!api) return []

    const transferTx = api.tx.balances.transfer(sellerTreasuryAccount, domainRegistrationPriceFixed)

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

  const onSuccess = async () => {
    setIsFetchNewDomains(true)
    reloadProcessingOrders({ domains: [domainName], recipient })
    setProcessingDomains({ [domainName]: true })
    
    close()
  }

  const onClick = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    if (pendingOrder) {
      await pendingOrderAction({
        action: deletePendingOrder,
        args: [domainName, sellerApiAuthTokenManager],
        account: purchaser,
        dispatch
      })
    }

    return await pendingOrderAction({
      action: createPendingOrder,
      args: [purchaser, domainName, sellerApiAuthTokenManager, 'DOT', recipient],
      account: purchaser,
      dispatch
    })
  }

  return (
    <LazyTxButton
      block
      type='primary'
      size='middle'
      network={sellerChain || ''}
      accountId={purchaser}
      disabled={
        !recipient ||
        !freeBalance ||
        !domainRegistrationPriceFixed ||
        new BN(freeBalance).lt(domainRegistrationPriceFixed)
      }
      tx={'utility.batchAll'}
      params={getParams}
      onSuccess={onSuccess}
      onClick={() => onClick()}
      label={'Register'}
      className={className}
    />
  )
}

export default BuyByDotTxButton
