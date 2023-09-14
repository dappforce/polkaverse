import { randomAsNumber } from '@polkadot/util-crypto'
import {
  newLogger,
  parseDomain,
  SocialRemark,
  SocialRemarkDestChainsNameId,
  SocialRemarkMessageVersion,
  SubSclSource,
} from '@subsocial/utils'
import BN from 'bignumber.js'
import { useEffect, useState } from 'react'
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
import { getOrInitSubsocialRpc } from 'src/rpc/initSubsocialRpc'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  useCreateReloadPendingOrders,
  useSelectPendingOrderById,
} from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { fetchPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { useCreateReloadMyDomains } from 'src/rtk/features/domains/domainHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useSubstrate } from '../substrate'
import { TxCallback } from '../substrate/SubstrateTxButton'
import { showErrorMessage } from '../utils/Message'
import { useGetDecimalAndSymbol } from '../utils/useGetDecimalsAndSymbol'
import { pendingOrderAction } from './dot-seller/utils'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import { BLOCKS_IN_YEAR } from './utils'

const log = newLogger('DD')

type BuyByDotTxButtonProps = {
  domainName: string
  className?: string
  price?: string
  close: () => void
}

export const useGetDomainPrice = (domain: string) => {
  const [price, setPrice] = useState()

  useEffect(() => {
    const getPrice = async () => {
      const subsocialRpc = getOrInitSubsocialRpc()

      const { domain: domainPart } = parseDomain(domain)
      const price = await subsocialRpc.calculatePrice(domainPart)

      setPrice(price)
    }

    getPrice().catch(err => log.error('Failed to get domain price', err))
  }, [domain])

  return price
}

export const BuyByDotTxButton = ({
  domainName,
  className,
  close,
  price,
}: BuyByDotTxButtonProps) => {
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

  const disableButton =
    !recipient ||
    !freeBalance ||
    !domainRegistrationPriceFixed ||
    new BN(freeBalance).lt(domainRegistrationPriceFixed) ||
    !price

  return (
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
  )
}

type BuyDomainSectionProps = {
  domainName: string
  label?: string
}

export const BuyDomainSection = ({ domainName, label = 'Register' }: BuyDomainSectionProps) => {
  const reloadMyDomains = useCreateReloadMyDomains()
  const { openManageModal, setProcessingDomains, recipient } = useManageDomainContext()
  const { api, isApiReady } = useSubstrate()
  const reloadPendingOrders = useCreateReloadPendingOrders()
  const { purchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const myAddress = useMyAddress()
  const pendingOrder = useSelectPendingOrderById(domainName)
  const dispatch = useAppDispatch()

  if (!isApiReady) return null

  const getTxParams = () => {
    return [recipient, domainName, null, BLOCKS_IN_YEAR.toString()]
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
      reload: false,
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

    if (preventTx) {
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
