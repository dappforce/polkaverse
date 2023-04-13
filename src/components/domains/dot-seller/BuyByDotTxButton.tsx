import { DomainEntity } from 'src/rtk/features/domains/domainsSlice'
import { useManageDomainContext } from '../manage/ManageDomainProvider'
import { useLazyConnectionsContext } from 'src/components/lazy-connection/LazyConnectionContext'
import { SocialRemark, SubSclSource } from '@subsocial/utils'
import { domainsNetwork, testRemarkTitle, treasuryAccount, validDomainPrice } from './config'
import LazyTxButton from 'src/components/donate/LazyTxButton'
import { randomAsNumber } from '@polkadot/util-crypto'

export type BuyByDotButtonProps = {
  domain: DomainEntity
  className?: string
}

type BuyByDotTxButtonProps = BuyByDotButtonProps & {
  close: () => void
}

const BuyByDotTxButton = ({ domain, className, close }: BuyByDotTxButtonProps) => {
  const { recipient, purchaser } = useManageDomainContext()

  const { getApiByNetwork } = useLazyConnectionsContext()

  const getParams = async () => {
    if (!purchaser) return []

    const api = await getApiByNetwork(domainsNetwork)

    if (!api) return []

    const transferTx = api.tx.balances.transfer(
      treasuryAccount,
      validDomainPrice,
    )

    SocialRemark.setConfig({ protNames: [ testRemarkTitle ] })

    const regRmrkMsg: SubSclSource<'DMN_REG'> = {
      protName: testRemarkTitle,
      action: 'DMN_REG',
      version: '0.1',
      content: {
        opId: `${transferTx.hash.toHex()}-${randomAsNumber()}`,
        domainName: domain.id,
        target: recipient,
        token: 'ROC',
      },
    }

    const remarkTx = api.tx.system.remark(new SocialRemark().fromSource(regRmrkMsg).toMessage())

    return [ [ transferTx, remarkTx ] ]
  }

  const onSuccess = () => {
    console.log('Extrinsic Success')
    close()
  }

  const onFailed = () => {
    console.log('Extrinsic failed')
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
      label={'Register'}
      className={className}
    />
  )
}

export default BuyByDotTxButton