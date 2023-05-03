import { Button, Modal, Space, Tag } from 'antd'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { SelectAccountInput } from 'src/components/common/inputs/SelectAccountInput'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'
import { useSubstrate } from 'src/components/substrate'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { FormatBalance, useCreateBalance } from '../../common/balances/Balance'
import { MutedDiv } from '../../utils/MutedText'
import { useManageDomainContext, DomainSellerKind } from '../manage/ManageDomainProvider'
import styles from './Index.module.sass'
import { useGetDecimalAndSymbol } from '../dot-seller/utils'
import { BuyByDotTxButton, BuyDomainSection } from '../BuyDomainButtons'

type ModalBodyProps = {
  domainName: string
  price?: string
  domainSellerKind: DomainSellerKind
}

const ModalBody = ({ domainName, price, domainSellerKind }: ModalBodyProps) => {
  const { recipient, purchaser, setRecipient, setPurchaser } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const nativeBalance = useCreateBalance(purchaser)
  const isMyAddress = useIsMyAddress(recipient)

  const { sellerChain } = sellerConfig || {}

  const isSub = domainSellerKind === 'SUB'

  const { decimal, symbol } = useGetDecimalAndSymbol(sellerChain)

  const chainProps = isSub ? {} : { decimals: decimal, currency: symbol }

  const balance = useBalancesByNetwork({
    account: purchaser,
    network: sellerChain,
    currency: symbol,
  })

  const { freeBalance } = balance || {}

  const balanceValue = isSub ? nativeBalance : freeBalance

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
              <FormatBalance value={balanceValue} {...chainProps} />
            </div>
          </div>
        </div>
        <SelectAccountInput
          className={`${styles.Select} w-100`}
          setValue={setPurchaser}
          value={purchaser}
          withAvatar={false}
          network={isSub ? undefined : sellerChain}
        />
      </Space>
      {!isSub && (
        <Space direction='vertical' size={8} className={'w-100'}>
          <div className={clsx(styles.Recipient, 'd-flex align-items-center')}>
            <div>Recipient </div>
            {isMyAddress && (
              <Tag color='green' className='ml-2'>
                Your account
              </Tag>
            )}
          </div>
          <SelectAccountInput
            className={`${styles.Select} w-100`}
            setValue={setRecipient}
            value={recipient}
            withAvatar={false}
            network={isSub ? undefined : sellerChain}
          />
          <MutedDiv className={styles.RecipientFieldDesc}>
            Choose the recipient to whom the domain will be registered
          </MutedDiv>
        </Space>
      )}
      <Space direction='vertical' size={16} className={clsx(styles.DomainInfo, 'w-100')}>
        <div className='d-flex align-items-center justify-content-between'>
          <MutedDiv>Domain name:</MutedDiv>
          <div className={styles.Domain}>{domainName}</div>
        </div>
        <div className='d-flex align-items-center justify-content-between'>
          <MutedDiv>Price:</MutedDiv>
          <div className='font-weight-bold'>
            <FormatBalance value={price} {...chainProps} />
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
  domainSellerKind: DomainSellerKind
  price?: string
}

const BuyDomainModal = ({ domainName, open, close, price, domainSellerKind }: BuyDomainModalProps) => {

  const title = (
    <div className={styles.ModalTitle}>
      <h2>Register new domain</h2>
    </div>
  )

  const isByDot = domainSellerKind === 'DOT'

  const modalFooter = (
    <div className={styles.FooterButtons}>
      {isByDot ? (
        <BuyByDotTxButton domainName={domainName} className={'ml-0'} close={close} />
      ) : (
        <BuyDomainSection domainName={domainName} />
      )}
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
      <ModalBody domainName={domainName} price={price} domainSellerKind={domainSellerKind} />
    </Modal>
  )
}

type BuyByDotButtonProps = {
  domainName: string
  label?: string
  withPrice?: boolean
  domainSellerKind: DomainSellerKind
}

const RegisterDomainButton = ({
  domainName,
  label = 'Register',
  withPrice = true,
  domainSellerKind,
}: BuyByDotButtonProps) => {
  const sellerConfig = useSelectSellerConfig()
  const { domainRegistrationPriceFixed, sellerChain } = sellerConfig || {}
  const { api } = useSubstrate()
  const { processingDomains } = useManageDomainContext()

  const [open, setOpen] = useState(false)
  const { decimal, symbol } = useGetDecimalAndSymbol(sellerChain)

  const close = () => setOpen(false)

  const isSub = domainSellerKind === 'SUB'

  const price = useMemo(() => {
    return isSub ? api?.consts.domains.baseDomainDeposit.toString() : domainRegistrationPriceFixed
  }, [domainSellerKind])

  const chainProps = isSub ? {} : { decimals: decimal, currency: symbol }

  const isProcessingDomain = processingDomains[domainName]

  return (
    <span className={styles.RegisterButton}>
      {withPrice && <div>{price ? <FormatBalance value={price} {...chainProps} /> : <>-</>}</div>}
      <Button
        type={'primary'}
        block
        disabled={isProcessingDomain}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <BuyDomainModal
        domainName={domainName}
        open={open}
        close={close}
        domainSellerKind={domainSellerKind || 'SUB'}
        price={price}
      />
    </span>
  )
}

export default RegisterDomainButton
