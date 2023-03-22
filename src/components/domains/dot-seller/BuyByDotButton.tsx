import { useMyAddress } from '../../auth/MyAccountsContext'
import { useLazyConnectionsContext } from '../../lazy-connection/LazyConnectionContext'
import { randomAsNumber } from '@polkadot/util-crypto'
import { SocialRemark } from './remark/core'
import { DomainEntity } from '../../../rtk/features/domains/domainsSlice'
import { useState } from 'react'
import { Button, Modal } from 'antd'
import { SelectAccountInput } from 'src/components/common/inputs/SelectAccountInput'
import { useManageDomainContext } from '../manage/ManageDomainProvider'
import styles from './Index.module.sass'
import { MutedDiv } from '../../utils/MutedText'
import clsx from 'clsx'
import { validDomainPrice, testRemarkTitle, treasuryAccount, domainsNetwork } from './config'
import { SubSclSource } from './remark/types'
import { useGetDecimalAndSymbol } from './utils'
import { FormatBalance } from '../../common/balances/Balance'
import LazyTxButton from 'src/components/donate/LazyTxButton'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'

type BuyByDotButtonProps = {
  domain: DomainEntity
  className?: string
}

type BuyByDotTxButtonProps = BuyByDotButtonProps & {
  close: () => void
}

const BuyByDotTxButton = ({ domain, className, close }: BuyByDotTxButtonProps) => {
  const { recipient } = useManageDomainContext()

  const myAddress = useMyAddress()
  const { getApiByNetwork } = useLazyConnectionsContext()

  const getParams = async () => {
    if (!myAddress) return []

    const api = await getApiByNetwork(domainsNetwork)

    if (!api) return []

    const transferTx = api.tx.balances.transfer(
      treasuryAccount,
      validDomainPrice,
    )

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
      accountId={myAddress}
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

type BuyDomainModalProps = BuyByDotButtonProps & {
  open: boolean
  close: () => void
}

const BuyDomainModal = ({ domain, open, close }: BuyDomainModalProps) => {
  const { id: domainId } = domain
  const myAddress = useMyAddress()
  const { recipient, setRecipient } = useManageDomainContext()
  const { decimal, symbol } = useGetDecimalAndSymbol(domainsNetwork)

  const balance = useBalancesByNetwork({ account: myAddress, network: domainsNetwork, currency: symbol })

  const { freeBalance } = balance || {}

  const title = (
    <div className={styles.ModalTitle}>
      <h2>Register {domainId}</h2>
      <MutedDiv>
        Now you need to choose the recipient to whom the domain will be registered
      </MutedDiv>
    </div>
  )

  const modalFooter = (
    <div className={styles.FooterButtons}>
      <Button type='primary' ghost block onClick={close}>
        Close
      </Button>
      <BuyByDotTxButton domain={domain} className={'ml-0'} close={close} />
    </div>
  )

  return (
    <Modal
      visible={open}
      onCancel={close}
      title={title}
      footer={modalFooter}
      width={550}
      destroyOnClose
      className={'DfSignInModal'}
    >
      <div className={styles.ModalBody}>
        <div
          className={clsx('d-flex align-items-center justify-content-between', styles.Recipient)}
        >
          <div>Recipient: </div>
          <div className='d-flex align-items-center'>
            <MutedDiv>Balance:</MutedDiv>
            <div className='ml-1'>
              <FormatBalance value={freeBalance} decimals={decimal} currency={symbol} />
            </div>
          </div>
        </div>
        <SelectAccountInput
          className={`${styles.Select} w-100`}
          setValue={setRecipient}
          value={recipient}
          withAvatar={false}
        />
      </div>
    </Modal>
  )
}

const BuyByDotButton = ({ domain }: BuyByDotButtonProps) => {
  const [ open, setOpen ] = useState(false)
  const { decimal, symbol } = useGetDecimalAndSymbol(domainsNetwork)

  const close = () => setOpen(false)

  const price = <FormatBalance value={validDomainPrice.toString()} decimals={decimal} currency={symbol}/>

  return (
    <span className={styles.RegisterButton}>
      <div>{price}</div>
      <Button type={'primary'} block onClick={() => setOpen(true)}>
        Register
      </Button>
      <BuyDomainModal domain={domain} open={open} close={close} />
    </span>
  )
}

export default BuyByDotButton
