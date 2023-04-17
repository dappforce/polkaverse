import { InfoCircleOutlined } from '@ant-design/icons'
import { isEmptyArray, SubDate } from '@subsocial/utils'
import { Space, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import CardWithContent from 'src/components/utils/cards/CardWithContent'
import { useSelectPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { PendingDomainEntity } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { MutedDiv } from '../../utils/MutedText'
import BuyByDotButton from '../dot-seller/BuyByDotModal'
import { getTime } from '../utils'
import styles from './Index.module.sass'

type PendingDomainProps = {
  pendingDomain: PendingDomainEntity
}

const PendingDomain = ({ pendingDomain }: PendingDomainProps) => {
  const sellerConfig = useSelectSellerConfig()

  const { domain, timestamp } = pendingDomain
  const { dmnRegPendingOrderExpTime } = sellerConfig || {}

  const expiresAt = SubDate.formatDate(
    dayjs(timestamp).valueOf() + (dmnRegPendingOrderExpTime || 0),
  )

  return (
    <div className='d-flex align-items-center justify-content-between'>
      <div className='d-flex align-items-center mr-2'>
        <div className='mlr-2'>{domain}</div>
        <Tooltip
          title={`Your domain reservation expires ${expiresAt}`}
          className={styles.TimeTooltip}
        >
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      <BuyByDotButton domainName={domain} label={'Continue'} withPrice={false} />
    </div>
  )
}

const PendingOrdersSection = () => {
  const pendingOrders = useSelectPendingOrdersByAccount()
  const sellerConfig = useSelectSellerConfig()

  const { dmnRegPendingOrderExpTime } = sellerConfig || {}

  const pendingDomains = useMemo(() => {
    const orders = pendingOrders.map((pendingDomain, i) => (
      <PendingDomain key={i} pendingDomain={pendingDomain} />
    ))

    return (
      <Space direction='vertical' size={16}>
        {orders}
      </Space>
    )
  }, [pendingOrders.length])

  if (!pendingOrders || isEmptyArray(pendingOrders)) return null

  return (
    <CardWithContent title={'Pending'} className='mb-4'>
      <MutedDiv className='mb-3'>
        You have a pending order to buy a domain. It will be canceled automatically after{' '}
        {getTime(dmnRegPendingOrderExpTime)} minutes.
      </MutedDiv>
      {pendingDomains}
    </CardWithContent>
  )
}

export default PendingOrdersSection
