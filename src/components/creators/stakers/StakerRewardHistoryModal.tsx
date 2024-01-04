import { ModalProps, Skeleton } from 'antd'
import { FormatBalance } from 'src/components/common/balances'
import { formatDate } from 'src/components/utils'
import CustomModal from 'src/components/utils/CustomModal'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'

export type StakerRewardHistoryModalProps = Pick<ModalProps, 'visible' | 'onCancel'>

export default function StakerRewardHistoryModal({
  onCancel,
  visible,
}: StakerRewardHistoryModalProps) {
  const { data, loading } = useFetchUserRewardHistory(undefined, { enabled: visible })
  return (
    <CustomModal title='Active Staking History' visible={visible} onCancel={onCancel}>
      <div className='d-flex flex-column GapSmall'>
        {(() => {
          if (loading) return <Skeleton />
          if (data?.rewards.length === 0) return <span className='ColorMuted'>No rewards yet</span>
          return data?.rewards.map(reward => (
            <div
              className='d-flex align-items-center justify-content-between GapSmall'
              key={reward.week}
            >
              <span className='ColorMuted FontSmall'>
                {formatDate(reward.startDate, 'DD.MM.YY')} -{' '}
                {formatDate(reward.endDate, 'DD.MM.YY')}
              </span>
              <span className='FontWeightSemibold'>
                + <FormatBalance currency='SUB' decimals={10} value={reward.reward} isShort />
              </span>
            </div>
          ))
        })()}
      </div>
    </CustomModal>
  )
}
