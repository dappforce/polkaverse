import { randomAsNumber } from '@polkadot/util-crypto'
import {
  newLogger,
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
import {
  createPendingOrder,
  deletePendingOrder,
  updatePendingOrder,
} from 'src/components/utils/OffchainUtils'
import TxButton from 'src/components/utils/TxButton'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  useCreateReloadPendingOrders,
  useSelectPendingOrderById,
} from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { fetchPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { useCreateReloadMyDomains } from 'src/rtk/features/domains/domainHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useCreateBalance } from '../common/balances'
import { useSubstrate } from '../substrate'
import { TxCallback } from '../substrate/SubstrateTxButton'
import { showErrorMessage } from '../utils/Message'
import { useGetDecimalAndSymbol } from '../utils/useGetDecimalsAndSymbol'
import WarningPanel from '../utils/WarningPanel'
import { pendingOrderAction } from './dot-seller/utils'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import { BLOCKS_IN_YEAR } from './utils'

export const log = newLogger('DD')

type BuyByDotTxButtonProps = {
  domainName: string
  className?: string
  price?: string
  close: () => void
}

export const BuyByDotTxButton = ({
  domainName,
  className,
  close,
  price,
}: BuyByDotTxButtonProps) => {
  const { recipient, purchaser, setDomainToFetch, setProcessingDomain } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const { getApiByNetwork } = useLazyConnectionsContext()
  const pendingOrder = useSelectPendingOrderById(domainName)

  const { sellerChain } = sellerConfig || {}

  const { symbol } = useGetDecimalAndSymbol(sellerChain)

  const balance = useBalancesByNetwork({
    account: purchaser,
    network: sellerChain,
    currency: symbol,
  })

  const { freeBalance } = balance || {}

  const getParams = async () => {
    if (!purchaser || !sellerConfig || !price) return []

    const {
      remarkProtName,
      sellerTreasuryAccount,
      remarkProtVersion,
      domainHostChain,
      sellerToken: { name: tokenName },
      sellerChain,
    } = sellerConfig

    const api = await getApiByNetwork(sellerChain)

    if (!api) return []

    const transferTx = api.tx.balances.transfer(sellerTreasuryAccount, price)

    SocialRemark.setConfig({ protNames: [remarkProtName] })

    const destination =
      SocialRemarkDestChainsNameId[domainHostChain as keyof typeof SocialRemarkDestChainsNameId]

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
    setDomainToFetch(domainName)
    setProcessingDomain(true)

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
        reload: false,
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

    if (preventTx) {
      setProcessingDomain(false)
    } else {
      await updatePendingOrder({
        domain: domainName,
        interrupted: false,
        txStarted: true,
        sellerApiAuthTokenManager,
      })
    }

    return preventTx
  }

  const onCancel = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    await updatePendingOrder({
      domain: domainName,
      interrupted: true,
      txStarted: false,
      sellerApiAuthTokenManager,
    })

    dispatch(fetchPendingOrdersByAccount({ id: myAddress, reload: true }))
  }

  const notEnoughTokens = freeBalance && price ? new BN(freeBalance).lt(price) : false

  const disableButton = !recipient || !freeBalance || !price || notEnoughTokens

  return (
    <div className={styles.TxButtonSection}>
      {notEnoughTokens && <WarningPanel desc={'You do not have enough tokens to buy a domain'} />}
      <LazyTxButton
        block
        type='primary'
        size='middle'
        network={sellerChain || ''}
        accountId={purchaser}
        disabled={disableButton}
        tx={'utility.batchAll'}
        params={getParams}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onClick={() => onClick()}
        label={'Register'}
        className={className}
      />
    </div>
  )
}

type BuyDomainSectionProps = {
  domainName: string
  label?: string
  price?: string
}

export const BuyDomainSection = ({
  domainName,
  label = 'Register',
  price,
}: BuyDomainSectionProps) => {
  const reloadMyDomains = useCreateReloadMyDomains()
  const { openManageModal, setProcessingDomain, recipient } = useManageDomainContext()
  const { api, isApiReady } = useSubstrate()
  const reloadPendingOrders = useCreateReloadPendingOrders()
  const { purchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const myAddress = useMyAddress()
  const pendingOrder = useSelectPendingOrderById(domainName)
  const dispatch = useAppDispatch()
  const nativeBalance = useCreateBalance(purchaser)

  if (!isApiReady) return null

  const getTxParams = () => {
    return [recipient, domainName, null, BLOCKS_IN_YEAR.toString()]
  }

  const onSuccess: TxCallback = async () => {
    if (!sellerConfig) return

    const { sellerApiAuthTokenManager } = sellerConfig

    reloadMyDomains()

    setProcessingDomain(false)

    await pendingOrderAction({
      action: deletePendingOrder,
      args: [domainName, sellerApiAuthTokenManager],
      account: purchaser,
      dispatch,
      reload: false,
    })

    reloadPendingOrders(purchaser)
    openManageModal('success', domainName)
  }

  const onFailed = async (errorInfo: any) => {
    const jsonErr = JSON.stringify(errorInfo)
    log.error('Failed:', jsonErr)

    errorInfo && showErrorMessage(jsonErr)
    setProcessingDomain(false)
  }

  const onClick = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    setProcessingDomain(true)

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

    if (preventTx) {
      setProcessingDomain(false)
    } else {
      await updatePendingOrder({
        domain: domainName,
        interrupted: false,
        txStarted: true,
        sellerApiAuthTokenManager,
      })
    }

    return preventTx
  }

  const onCancel = async () => {
    if (!sellerConfig || !myAddress) return

    const { sellerApiAuthTokenManager } = sellerConfig

    await updatePendingOrder({
      domain: domainName,
      interrupted: true,
      txStarted: false,
      sellerApiAuthTokenManager,
    })

    dispatch(fetchPendingOrdersByAccount({ id: myAddress, reload: true }))
  }

  const notEnoughTokens =
    nativeBalance && price ? new BN(nativeBalance.toString()).lt(price) : false

  const disableButton = !recipient || !nativeBalance || !price || notEnoughTokens

  return (
    <div className={styles.TxButtonSection}>
      {notEnoughTokens && <WarningPanel desc={'You do not have enough tokens to buy a domain'} />}
      <TxButton
        type='primary'
        customNodeApi={api}
        accountId={purchaser}
        block
        size='middle'
        disabled={disableButton}
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
    </div>
  )
}
