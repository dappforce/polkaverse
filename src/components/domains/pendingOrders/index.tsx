import { InfoCircleOutlined } from '@ant-design/icons'
import { isEmptyArray } from '@subsocial/utils'
import { Button, Tooltip } from 'antd'
import { useMemo } from 'react'
import CardWithContent from 'src/components/utils/cards/CardWithContent'
import { useSelectPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { PendingDomainEntity } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { MutedDiv } from '../../utils/MutedText'

type PendingDomainProps = {
  pendingDomain: PendingDomainEntity
}

const PendingDomain = ({ pendingDomain }: PendingDomainProps) => {
  const { domain, timestamp } = pendingDomain
  return (
    <div className='d-flex align-items-center justify-content-between'>
      <div className='d-flex align-items-center'>
        <div className='mlr-2'>{domain}</div>
        <Tooltip title={'Your domain reservation expires in 7 minutes'}>
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      <Button type='primary'>Continue</Button>
    </div>
  )
}

const PendingOrdersSection = () => {
  const pendingOrders = useSelectPendingOrdersByAccount()

  const pendingDomains = useMemo(() => {
    return pendingOrders.map((pendingDomain, i) => (
      <PendingDomain key={i} pendingDomain={pendingDomain} />
    ))
  }, [pendingOrders.length])

  if (!pendingOrders || isEmptyArray(pendingOrders)) return null

  return (
    <CardWithContent title={'Pending'}>
      <MutedDiv>
        You have a pending order to buy a domain. It will be canceled automatically after 10
        minutes.
      </MutedDiv>
      {pendingDomains}
    </CardWithContent>
  )
}

export default PendingOrdersSection
