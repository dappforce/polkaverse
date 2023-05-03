import { randomAsNumber } from '@polkadot/util-crypto'
import {
  SocialRemark,
  SocialRemarkDestChainsNameId,
  SocialRemarkMessageVersion,
  SubSclSource,
  newLogger,
} from '@subsocial/utils'
import BN from 'bignumber.js'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'
import LazyTxButton from 'src/components/donate/LazyTxButton'
import { useLazyConnectionsContext } from 'src/components/lazy-connection/LazyConnectionContext'
import { createPendingOrder, deletePendingOrder, updatePendingOrder } from 'src/components/utils/OffchainUtils'
import { useAppDispatch } from 'src/rtk/app/store'
import { useCreateReloadPendingOrders, useSelectPendingOrderById } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { fetchPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { pendingOrderAction, useGetDecimalAndSymbol } from './dot-seller/utils'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import TxButton from 'src/components/utils/TxButton'
import { useCreateReloadMyDomains } from 'src/rtk/features/domains/domainHooks'
import { useSubstrate } from '../substrate'
import { TxCallback } from '../substrate/SubstrateTxButton'
import { showErrorMessage } from '../utils/Message'
import styles from './index.module.sass'

const log = newLogger('DD')

type BuyByDotTxButtonProps = {
  domainName: string
  className?: string
  close: () => void
}

function getKeyName(value: string) {
  return Object.entries(SocialRemarkDestChainsNameId).find(([key]) => key === value)?.[1]
}

export const BuyByDotTxButton = ({ domainName, className, close }: BuyByDotTxButtonProps) => {
  const { recipient, purchaser, setIsFetchNewDomains, setProcessingDomains } =
    useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const { getApiByNetwork } = useLazyConnectionsContext()
  const pendingOrder = useSelectPendingOrderById(domainName)

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
        dispatch,
        reload: false
      })
    }

    const preventTx = await pendingOrderAction({
      action: createPendingOrder,
      args: [
        {
          sellerApiAuthTokenManager,
          createdByAccount: myAddress,
          destination: 'DOT',
          domain: domainName,
          signer: purchaser,
          target: recipient,
        },
      ],
      account: purchaser,
      dispatch,
    })

    if(preventTx) {
      setProcessingDomains({ [domainName]: false })
    }

    return preventTx
  }

  const onCancel = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    await updatePendingOrder(domainName, true, sellerApiAuthTokenManager)

    dispatch(fetchPendingOrdersByAccount({ id: myAddress, reload: true }))
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
      onCancel={onCancel}
      onClick={() => onClick()}
      label={'Register'}
      className={className}
    />
  )
}

const BLOCK_TIME = 12
const SECS_IN_DAY = 60 * 60 * 24
const BLOCKS_IN_YEAR = new BN((SECS_IN_DAY * 365) / BLOCK_TIME)

type BuyDomainSectionProps = {
  domainName: string
  label?: string
}

export const BuyDomainSection = ({ domainName, label = 'Register' }: BuyDomainSectionProps) => {
  const reloadMyDomains = useCreateReloadMyDomains()
  const { openManageModal, setProcessingDomains } = useManageDomainContext()
  const { api, isApiReady } = useSubstrate()
  const reloadPendingOrders = useCreateReloadPendingOrders()
  const { purchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const myAddress = useMyAddress()
  const pendingOrder = useSelectPendingOrderById(domainName)
  const dispatch = useAppDispatch()

  if (!isApiReady) return null

  const getTxParams = () => {
    return [domainName, null, BLOCKS_IN_YEAR.toString()]
  }

  const onSuccess: TxCallback = async () => {
    if (!sellerConfig) return

    const { sellerApiAuthTokenManager } = sellerConfig

    reloadMyDomains()

    setProcessingDomains({ [domainName]: false })

    await pendingOrderAction({
      action: deletePendingOrder,
      args: [domainName, sellerApiAuthTokenManager],
      account: purchaser,
      dispatch,
      reload: false
    })

    reloadPendingOrders(purchaser)
    openManageModal('success', domainName)
  }

  const onFailed = async (errorInfo: any) => {
    const jsonErr = JSON.stringify(errorInfo)
    log.error('Failed:', jsonErr)
    
    showErrorMessage(jsonErr)
    setProcessingDomains({ [domainName]: false })
  }

  const onClick = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    setProcessingDomains({ [domainName]: true })

    if (pendingOrder) {
      await pendingOrderAction({
        action: deletePendingOrder,
        args: [domainName, sellerApiAuthTokenManager],
        account: purchaser,
        dispatch,
      })
    }

    const preventTx = await pendingOrderAction({
      action: createPendingOrder,
      args: [
        {
          sellerApiAuthTokenManager,
          createdByAccount: myAddress,
          destination: 'SUB',
          domain: domainName,
          signer: purchaser,
          target: '',
        },
      ],
      account: purchaser,
      dispatch,
    })

    if(preventTx) {
      setProcessingDomains({ [domainName]: false })
    }

    return preventTx
  }

  const onCancel = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    await updatePendingOrder(domainName, true, sellerApiAuthTokenManager)

    dispatch(fetchPendingOrdersByAccount({ id: myAddress, reload: true }))
  }

  return (
    <span className='d-flex align-items-center w-100'>
      <TxButton
        type='primary'
        customNodeApi={api}
        accountId={purchaser}
        block
        size='middle'
        label={label}
        tx={'domains.registerDomain'}
        onSuccess={onSuccess}
        onFailed={onFailed}
        onCancel={onCancel}
        isFreeTx
        onClick={() => onClick()}
        params={getTxParams}
        className={styles.DomainPrimaryButton}
      />
    </span>
  )
}
