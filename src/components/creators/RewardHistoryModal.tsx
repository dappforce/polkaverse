import { ModalProps, Skeleton } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useMemo } from 'react'
import { FormatBalance } from 'src/components/common/balances'
import { formatDate } from 'src/components/utils'
import CustomModal from 'src/components/utils/CustomModal'
import { MutedSpan } from 'src/components/utils/MutedText'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'
import { RewardHistory } from 'src/rtk/features/activeStaking/rewardHistorySlice'

export type RewardHistoryModalProps = Pick<ModalProps, 'visible' | 'onCancel'>

export default function RewardHistoryModal({ onCancel, visible }: RewardHistoryModalProps) {
  const { data, loading } = useFetchUserRewardHistory(undefined, { enabled: visible })
  const creatorRewards = data?.rewards.filter(reward => BigInt(reward.creatorReward) > 0)

  return (
    <CustomModal title='Active Staking History' visible={visible} onCancel={onCancel}>
      <RewardHistoryPanel
        title='Staker Rewards'
        loading={loading}
        rewardHistory={data}
        rewardType='staker'
      />

      {(creatorRewards?.length ?? 0) > 0 && (
        <RewardHistoryPanel
          title='Creator Rewards'
          rewardHistory={data}
          loading={loading}
          rewardType='creator'
        />
      )}
    </CustomModal>
  )
}

export function RewardHistoryPanel({
  loading,
  rewardHistory,
  rewardType,
  title,
  ...props
}: {
  title: string
  rewardHistory: RewardHistory | undefined
  loading: boolean | undefined
  rewardType: 'staker' | 'creator'
} & ComponentProps<'div'>) {
  const rewards = useMemo(() => {
    if (rewardType === 'staker') return rewardHistory?.rewards ?? []
    return rewardHistory?.rewards.filter(reward => BigInt(reward.creatorReward) > 0) ?? []
  }, [rewardHistory, rewardType])

  return (
    <div {...props} className={clsx('d-flex flex-column', props.className)}>
      <MutedSpan className='mb-1 FontWeightSemibold'>{title}</MutedSpan>
      <div className='d-flex flex-column GapTiny'>
        {(() => {
          if (loading) return <Skeleton />
          if (rewards.length === 0) return <span className='ColorMuted'>No rewards yet</span>

          return rewards.map(reward => {
            const usedRewardValue = rewardType === 'creator' ? reward.creatorReward : reward.reward
            return (
              <div
                className='d-flex align-items-center justify-content-between GapSmall'
                key={reward.week}
              >
                <span className='ColorMuted FontSmall'>
                  {formatDate(reward.startDate, 'DD.MM.YY')} -{' '}
                  {formatDate(reward.endDate, 'DD.MM.YY')}
                </span>
                <span className='FontWeightSemibold'>
                  +{' '}
                  <FormatBalance
                    currency='SUB'
                    decimals={10}
                    value={usedRewardValue}
                    precision={2}
                  />
                </span>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
