import { Skeleton, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { ComponentProps, useState } from 'react'
import { RiHistoryFill } from 'react-icons/ri'
import { SlQuestion } from 'react-icons/sl'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { MutedSpan } from 'src/components/utils/MutedText'
import { Pluralize } from 'src/components/utils/Plularize'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import StakerRewardHistoryModal from './StakerRewardHistoryModal'
import styles from './StakerRewardInfo.module.sass'
import StakerRewardProgressBar, { StakerRewardProgressBarProps } from './StakerRewardProgressBar'

const { DISTRIBUTION_DAY, SUPER_LIKES_FOR_MAX_REWARD } = CREATORS_CONSTANTS

export type StakerRewardInfoProps = Omit<ComponentProps<'div'>, 'size'> &
  Pick<StakerRewardProgressBarProps, 'size'>

export default function StakerRewardInfo({ size, ...props }: StakerRewardInfoProps) {
  const sendEvent = useSendEvent()
  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const [isOpenRewardHistoryModal, setIsOpenRewardHistoryModal] = useState(false)
  const { data, loading } = useFetchUserRewardReport()

  if (loading) {
    return (
      <div className='p-3'>
        <Skeleton />
      </div>
    )
  }

  const todayReward = data?.currentRewardAmount ?? '0'
  const weekReward = data?.weeklyReward ?? '0'

  if (!(BigInt(todayReward) || BigInt(weekReward))) {
    return (
      <p className='FontSmall p-3 mb-1'>
        Like the posts on the &quot;
        <Link href='/?tab=posts&type=suggested&date=week' passHref>
          <a className='ColorPrimary FontWeightMedium'>Posts &gt; Active Staking</a>
        </Link>
        &quot; tab to increase your staking rewards by 50-200%.
      </p>
    )
  }

  const likeCount = data?.superLikesCount ?? 0
  const likesToMaxReward = SUPER_LIKES_FOR_MAX_REWARD - likeCount

  // monday: 7 days, tuesday: 6 days, ..., sunday: 1 day
  const dayLeftUntilDistribution = ((DISTRIBUTION_DAY + 7 - dayjs.utc().get('day')) % 7) + 1

  return (
    <>
      <div {...props} className={clsx(styles.StakerRewardInfo, 'FontSmall', props.className)}>
        <div className={clsx(styles.Goal, 'pb-1')}>
          <div className={styles.GoalInfo}>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>
                {likesToMaxReward > 0 ? 'Daily Activity Target' : 'Daily Target Hit'}
              </MutedSpan>
              <Tooltip
                title={
                  <>
                    <p className='mb-2'>
                      Each post you like today, up to a maximum of 10, will boost your rewards, and
                      reward the authors of the posts you like.
                    </p>
                    <p className='mb-0'>
                      If you like more than 10, those author rewards will then be distributed among
                      more authors, resulting in each author receiving fewer rewards.
                    </p>
                  </>
                }
              >
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <StakerSuperLikeCount />
          </div>
          <StakerRewardProgressBar size={size} className='mt-1' />
        </div>
        <div className='d-flex flex-column GapTiny mt-2'>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Earned today</MutedSpan>
              <Tooltip title='The minimum bonus rewards you have earned today from Active Staking, which may increase depending on network activity'>
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <span className='FontWeightSemibold d-flex align-items-center GapMini'>
              {loading ? (
                <NumberSkeleton />
              ) : (
                <span>
                  <MutedSpan>≥</MutedSpan>{' '}
                  <FormatBalance
                    withMutedDecimals={false}
                    currency='SUB'
                    decimals={10}
                    value={todayReward}
                    precision={2}
                  />
                </span>
              )}
            </span>
          </div>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Earned this week</MutedSpan>
              <Tooltip title='The bonus rewards you have earned this week from participating in Active Staking'>
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <span className='FontWeightSemibold d-flex align-items-center GapMini'>
              {loading ? (
                <NumberSkeleton />
              ) : (
                <span>
                  <MutedSpan>≥</MutedSpan>{' '}
                  <FormatBalance
                    withMutedDecimals={false}
                    currency='SUB'
                    value={weekReward}
                    decimals={10}
                    precision={2}
                  />
                </span>
              )}
            </span>
          </div>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Distribution in</MutedSpan>
              <Tooltip title='How long until you will receive your bonus staking rewards for this week'>
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <span className='FontWeightSemibold'>
              <Pluralize count={dayLeftUntilDistribution} singularText='day' pluralText='days' />
            </span>
          </div>
          <div
            className='pt-2 px-3 d-flex justify-content-center align-items-center ColorPrimary FontWeightMedium GapMini'
            onClick={() => {
              sendEvent('astake_reward_history_opened', {
                amountRange: getAmountRange(totalStake?.amount),
              })
              setIsOpenRewardHistoryModal(true)
            }}
            style={{ cursor: 'pointer' }}
          >
            <RiHistoryFill />
            <span className='FontSmall'>Rewards History</span>
          </div>
        </div>
      </div>

      <StakerRewardHistoryModal
        visible={isOpenRewardHistoryModal}
        onCancel={() => setIsOpenRewardHistoryModal(false)}
      />
    </>
  )
}

export function StakerSuperLikeCount() {
  const { data, loading } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0
  const isMoreThanMax = likeCount > SUPER_LIKES_FOR_MAX_REWARD
  const surplusLike = isMoreThanMax ? likeCount - SUPER_LIKES_FOR_MAX_REWARD : 0

  return (
    <span className='FontWeightSemibold d-flex align-items-center'>
      {loading ? (
        <NumberSkeleton />
      ) : (
        <span>{Math.min(likeCount, SUPER_LIKES_FOR_MAX_REWARD)}</span>
      )}
      <MutedSpan>/10</MutedSpan>
      {!!surplusLike && <span className='ml-1'> +{surplusLike}</span>}
    </span>
  )
}

function NumberSkeleton() {
  return (
    <div className='d-flex align-items-center'>
      <Skeleton.Input
        style={{
          height: '1em',
          width: '3ch',
          marginRight: '4px',
          borderRadius: '20px',
          position: 'relative',
          top: '1px',
          display: 'block',
        }}
      />
    </div>
  )
}
