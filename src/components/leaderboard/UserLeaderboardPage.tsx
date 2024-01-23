import { Button, Radio } from 'antd'
import clsx from 'clsx'
import router from 'next/router'
import { useState } from 'react'
import { RiHistoryFill } from 'react-icons/ri'
import { ReactNode } from 'react-markdown'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'
import { useFetchUserStatistics } from 'src/rtk/features/leaderboard/hooks'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { replaceUrl } from 'src/utils/window'
import { FormatBalance } from '../common/balances'
import RewardHistoryModal, { RewardHistoryPanel } from '../creators/RewardHistoryModal'
import { PageContent } from '../main/PageWrapper'
import { useIsMobileWidthOrDevice } from '../responsive'
import DfCard from '../utils/cards/DfCard'
import { MutedSpan } from '../utils/MutedText'
import ProfileCard from './common/ProfileCard'
import StatisticCard from './common/StatisticCard'
import LeaderboardTable from './LeaderboardTable'
import styles from './UserLeaderboardPage.module.sass'

const stats: Record<
  string,
  { title: string; value: (data: UserStatistics) => ReactNode; tooltip: string }[]
> = {
  creator: [
    {
      title: 'Likes I received this week',
      value: data => data.creator.likesCountByPeriod,
      tooltip: 'The amount of likes that all of your posts received this week',
    },
    {
      title: 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The amount of SUB rewards you have earned this week from Active Staking rewards',
    },
    {
      title: 'Stakers that liked me this week',
      value: data => data.creator.stakersWhoLiked,
      tooltip: 'The amount of individual stakers that liked at least one of your posts this week',
    },
    {
      title: 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The total amount of SUB rewards you have earned from Active Staking rewards',
    },
  ],
  staker: [
    {
      title: 'Posts I liked this week',
      value: data => data.staker.likedPosts,
      tooltip: 'The number of individual posts that you liked this week',
    },
    {
      title: 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The amount of SUB rewards you have earned this week from Active Staking rewards',
    },
    {
      title: 'Creators I liked this week',
      value: data => data.staker.likedCreators,
      tooltip:
        'The number of individual creators that you supported this week by liking at least one of their posts',
    },
    {
      title: 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip:
        'The total amount of SUB rewards you have earned this week from Active Staking rewards',
    },
  ],
}

export type UserLeaderboardPageProps = {
  address: string
  tab: 'staker' | 'creator'
}
export default function UserLeaderboardPage({ address, tab }: UserLeaderboardPageProps) {
  const [tabState, setTabState] = useState<'staker' | 'creator'>(tab)
  const { data } = useFetchUserStatistics(address)
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false)
  const isMobile = useIsMobileWidthOrDevice()

  const { data: rewardHistory, loading } = useFetchUserRewardHistory(address)

  return (
    <PageContent withLargerMaxWidth meta={{ title: 'Active Staking Dashboard' }}>
      <div className={clsx(styles.Title)}>
        <h1 className='DfUnboundedTitle ColorNormal mb-0 FontBig'>Active Staking Dashboard</h1>
        <div className='d-flex align-items-center GapNormal justify-content-between'>
          <div className='d-flex align-items-center GapTiny'>
            <span>Role:</span>

            <Radio.Group
              className='DfRadioGroup'
              options={[
                { label: 'Staker', value: 'staker' },
                { label: 'Creator', value: 'creator' },
                { label: 'General', value: 'general' },
              ]}
              onChange={e => {
                const value = e.target.value
                if (value === 'general') {
                  router.push('/leaderboard')
                  return
                }
                setTabState(value)
                replaceUrl(`/leaderboard/${address}?tab=${value}`)
              }}
              value={tabState}
              optionType='button'
            />
          </div>
          <Button
            type='link'
            className='d-flex align-items-center GapTiny lg-hidden'
            onClick={() => setIsOpenHistoryModal(true)}
          >
            <RiHistoryFill />
            <span className='FontSmall'>Rewards History</span>
          </Button>
        </div>
      </div>
      {data && (
        <div className={clsx(styles.Statistics)}>
          <ProfileCard
            address={address}
            subtitle={`as a ${tabState === 'creator' ? 'Creator' : 'Staker'}`}
          />
          {stats[tabState].map(stat => (
            <StatisticCard
              tooltip={stat.tooltip}
              title={stat.title}
              value={stat.value(data)}
              key={stat.title}
            />
          ))}
        </div>
      )}
      <div className={clsx(styles.Leaderboard)}>
        <DfCard size='small' withShadow={false} className='sm-hidden'>
          <RewardHistoryPanel
            title={tabState === 'creator' ? 'My Creator Rewards' : 'My Staker Rewards'}
            loading={loading}
            rewardHistory={rewardHistory}
            rewardType={tabState}
          />
        </DfCard>
        <DfCard size='small' withShadow={false}>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>Leaderboard</span>
            <MutedSpan className='FontSmall'>
              {tabState === 'staker'
                ? 'Stakers ranked based on the amount of SUB earned with Active Staking.'
                : 'Creators ranked based on the amount of SUB earned with Active Staking.'}
            </MutedSpan>
          </div>
          <LeaderboardTable className='mt-3' role={tabState === 'creator' ? 'CREATOR' : 'STAKER'} />
        </DfCard>
      </div>
      {isMobile && (
        <RewardHistoryModal
          visible={isOpenHistoryModal}
          onCancel={() => setIsOpenHistoryModal(false)}
        />
      )}
    </PageContent>
  )
}
