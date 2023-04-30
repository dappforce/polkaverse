import { InfoCircleOutlined } from '@ant-design/icons'
import { isEmptyArray, SubDate } from '@subsocial/utils'
import { Space, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import CardWithContent from 'src/components/utils/cards/CardWithContent'
import { useCreateReloadPendingOrdersByAccount, useSelectPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { PendingDomainEntity } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import {
  useFetchProcessingOrdersByIds,
  useSelectProcessingOrderById,
} from 'src/rtk/features/processingRegistrationOrders/processingRegistratoinOrdersHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { MutedDiv } from '../../utils/MutedText'
import RegisterDomainButton from '../dot-seller/RegisterDomainModal'
import { useManageDomainContext, Variant } from '../manage/ManageDomainProvider'
import { getTime } from '../utils'
import styles from './Index.module.sass'

type PendingDomainProps = {
  pendingDomain: PendingDomainEntity
  time: number
}

const PendingDomain = ({ pendingDomain, time }: PendingDomainProps) => {
  const sellerConfig = useSelectSellerConfig()
  const processingOrder = useSelectProcessingOrderById(pendingDomain.id)
  const reloadPendingOrders = useCreateReloadPendingOrdersByAccount()
  const myAddress = useMyAddress()

  const { processingDomains } = useManageDomainContext()

  const { id, timestamp, destination } = pendingDomain
  const { dmnRegPendingOrderExpTime } = sellerConfig || {}

  const expiresAt = useMemo(() => {
    const expiresAtValue = dayjs(timestamp).valueOf() + (dmnRegPendingOrderExpTime || 0) 

    if(time >= expiresAtValue + 12000) {
      reloadPendingOrders(myAddress)

      return
    }

    return SubDate.formatDate(expiresAtValue)
  }, [time])

  const isDomainProcessing = processingDomains[pendingDomain.id]

  return (
    <div className='d-flex align-items-center justify-content-between'>
      <div className='d-flex align-items-center mr-2'>
        <div className='mlr-2'>{id}</div>
        <Tooltip
          title={`Your domain reservation expires ${expiresAt}`}
          className={styles.TimeTooltip}
        >
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      {processingOrder || isDomainProcessing ? (
        <Tag color='gold' className={clsx(styles.PendingTag)}>
          Processing
        </Tag>
      ) : (
        <RegisterDomainButton
          domainName={id}
          label={'Continue'}
          withPrice={false}
          variant={destination as Variant}
        />
      )}
    </div>
  )
}

const PendingOrdersSection = () => {
  const pendingOrders = useSelectPendingOrdersByAccount()
  const sellerConfig = useSelectSellerConfig()
  const myAddress = useMyAddress()
  const [time, setTime] = useState<number>(dayjs().valueOf())

  const pendingDomainsNames = pendingOrders?.map(order => order.id)

  useFetchProcessingOrdersByIds(pendingDomainsNames, myAddress)

  const { dmnRegPendingOrderExpTime } = sellerConfig || {}

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().valueOf())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const pendingDomains = useMemo(() => {
    const orders = pendingOrders.map((pendingDomain, i) => (
      <PendingDomain key={i} pendingDomain={pendingDomain} time={time} />
    ))

    return (
      <Space direction='vertical' size={16}>
        {orders}
      </Space>
    )
  }, [pendingOrders.length, time])

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
