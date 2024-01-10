import { Tooltip } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { SlQuestion } from 'react-icons/sl'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { DfImage } from 'src/components/utils/DfImage'
import { MutedSpan } from 'src/components/utils/MutedText'
import { Pluralize } from 'src/components/utils/Plularize'
import Segment from 'src/components/utils/Segment'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { activeStakingLinks } from 'src/utils/links'
import NumberSkeleton from '../common/NumberSkeleton'
import styles from './CreatorRewardInfoCard.module.sass'

export default function CreatorRewardInfoCard() {
  const sendEvent = useSendEvent()
  const myAddress = useMyAddress() ?? ''
  const { data: rewardReport, loading } = useFetchUserRewardReport(myAddress)

  if (loading || !rewardReport?.receivedLikes) return null

  return (
    <Segment className={clsx(styles.CreatorRewardInfoCard)}>
      <div className={styles.TopSection}>
        <div className='d-flex align-items-center GapNormal justify-content-between'>
          <p className={clsx(styles.Title, 'mb-0')}>Weekly Creator Rewards</p>
        </div>
        <Link href={activeStakingLinks.learnMore} passHref>
          <a
            target='_blank'
            className={styles.Link}
            onClick={() => sendEvent('astake_banner_learn_more', { eventSource: 'rewardInfo' })}
          >
            How does this work?
          </a>
        </Link>
        <DfImage preview={false} src='/images/databases.svg' className={styles.Image} />
      </div>
      <div className={clsx(styles.BottomSection)}>
        <div className='d-flex flex-column GapTiny FontSmall p-3'>
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Received likes</MutedSpan>
              <Tooltip title='The amount of times your posts have been superliked this week'>
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <span className='FontWeightSemibold d-flex align-items-center GapMini'>
              {loading ? <NumberSkeleton /> : <span>{rewardReport.receivedLikes}</span>}
            </span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Earned from posts</MutedSpan>
              <Tooltip title='The minimum amount of SUB that you will earn as a result of your posts being superliked this week'>
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
                    value={rewardReport.creatorReward}
                    precision={2}
                  />
                </span>
              )}
            </span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Distribution in</MutedSpan>
              <Tooltip title='How long until you will receive your creator rewards for this week'>
                <SlQuestion className='FontTiny ColorMuted' />
              </Tooltip>
            </div>
            <span className='FontWeightSemibold'>
              <Pluralize
                count={CREATORS_CONSTANTS.getDistributionDaysLeft()}
                singularText='day'
                pluralText='days'
              />
            </span>
          </div>
        </div>
      </div>
    </Segment>
  )
}
