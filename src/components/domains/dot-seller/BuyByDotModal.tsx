import { Button, Modal, Space } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { SelectAccountInput } from 'src/components/common/inputs/SelectAccountInput'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { FormatBalance } from '../../common/balances/Balance'
import { MutedDiv } from '../../utils/MutedText'
import { useManageDomainContext } from '../manage/ManageDomainProvider'
import BuyByDotTxButton from './BuyByDotTxButton'
import styles from './Index.module.sass'
import { useGetDecimalAndSymbol } from './utils'

type ModalBodyProps = {
  domainName: string
}

const ModalBody = ({ domainName }: ModalBodyProps) => {
  const { recipient, purchaser, setRecipient, setPurchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()

  const { domainRegistrationPriceFixed, sellerChain } = sellerConfig || {}

  const { decimal, symbol } = useGetDecimalAndSymbol(sellerChain)

  const balance = useBalancesByNetwork({
    account: purchaser,
    network: sellerChain,
    currency: symbol,
  })

  const { freeBalance } = balance || {}

  return (
    <Space direction='vertical' size={24} className={clsx(styles.ModalBody, 'w-100')}>
      <Space direction='vertical' size={8} className={'w-100'}>
        <div
          className={clsx('d-flex align-items-center justify-content-between', styles.Recipient)}
        >
          <div>Purchaser </div>
          <div className='d-flex align-items-center'>
            <MutedDiv>Balance:</MutedDiv>
            <div className='ml-1'>
              <FormatBalance value={freeBalance} decimals={decimal} currency={symbol} />
            </div>
          </div>
        </div>
        <SelectAccountInput
          className={`${styles.Select} w-100`}
          setValue={setPurchaser}
          value={purchaser}
          withAvatar={false}
          network={sellerChain}
        />
      </Space>
      <Space direction='vertical' size={8} className={'w-100'}>
        <div className={clsx(styles.Recipient)}>
          <div>Recipient </div>
        </div>
        <SelectAccountInput
          className={`${styles.Select} w-100`}
          setValue={setRecipient}
          value={recipient}
          withAvatar={false}
          network={sellerChain}
        />
        <MutedDiv className={styles.RecipientFieldDesc}>
          Choose the recipient to whom the domain will be registered
        </MutedDiv>
      </Space>
      <Space direction='vertical' size={16} className={clsx(styles.DomainInfo, 'w-100')}>
        <div className='d-flex align-items-center justify-content-between'>
          <MutedDiv>Domain name:</MutedDiv>
          <div className={styles.Domain}>{domainName}</div>
        </div>
        <div className='d-flex align-items-center justify-content-between'>
          <MutedDiv>Price:</MutedDiv>
          <div className='font-weight-bold'>
            <FormatBalance
              value={domainRegistrationPriceFixed}
              decimals={decimal}
              currency={symbol}
            />
          </div>
        </div>
      </Space>
    </Space>
  )
}

type BuyDomainModalProps = {
  domainName: string
  open: boolean
  close: () => void
}

const BuyDomainModal = ({ domainName, open, close }: BuyDomainModalProps) => {
  const title = (
    <div className={styles.ModalTitle}>
      <h2>Register new domain</h2>
    </div>
  )

  const modalFooter = (
    <div className={styles.FooterButtons}>
      <BuyByDotTxButton domainName={domainName} className={'ml-0'} close={close} />
    </div>
  )

  return (
    <Modal
      visible={open}
      onCancel={close}
      title={title}
      footer={modalFooter}
      width={520}
      destroyOnClose
      className={clsx('DfSignInModal', styles.DomainModal)}
    >
      <ModalBody domainName={domainName} />
    </Modal>
  )
}

type BuyByDotButtonProps = {
  domainName: string
  label?: string
  withPrice?: boolean
}

const BuyByDotButton = ({
  domainName,
  label = 'Register',
  withPrice = true,
}: BuyByDotButtonProps) => {
  const sellerConfig = useSelectSellerConfig()
  const { domainRegistrationPriceFixed, sellerChain } = sellerConfig || {}

  const [open, setOpen] = useState(false)
  const { decimal, symbol } = useGetDecimalAndSymbol(sellerChain)

  const close = () => setOpen(false)

  const price = domainRegistrationPriceFixed ? (
    <FormatBalance
      value={domainRegistrationPriceFixed.toString()}
      decimals={decimal}
      currency={symbol}
    />
  ) : (
    <div>-</div>
  )

  return (
    <span className={styles.RegisterButton}>
      {withPrice && <div>{price}</div>}
      <Button type={'primary'} block onClick={() => setOpen(true)}>
        {label}
      </Button>
      <BuyDomainModal domainName={domainName} open={open} close={close} />
    </span>
  )
}

export default BuyByDotButton
