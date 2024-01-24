import { Radio, Tabs } from 'antd'
import clsx from 'clsx'
import router, { useRouter } from 'next/router'
import { useState } from 'react'
import { ReactNode } from 'react-markdown'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'
import { useFetchUserStatistics } from 'src/rtk/features/leaderboard/hooks'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import RewardHistoryModal, { RewardHistoryPanel } from '../creators/RewardHistoryModal'
import { PageContent } from '../main/PageWrapper'
import { useIsMobileWidthOrDevice } from '../responsive'
import DfCard from '../utils/cards/DfCard'
import { MutedSpan } from '../utils/MutedText'
import LeaderboardTable from './common/LeaderboardTable'
import ProfileCard from './common/ProfileCard'
import StatisticCard from './common/StatisticCard'
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
}
export default function UserLeaderboardPage({ address }: UserLeaderboardPageProps) {
  const myAddress = useMyAddress()

  const { query } = useRouter()
  let tabState = query.tab as 'staker' | 'creator'
  if (tabState !== 'staker' && tabState !== 'creator') {
    tabState = 'staker'
  }

  const { data } = useFetchUserStatistics(address)
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false)
  const isMobile = useIsMobileWidthOrDevice()

  const { data: rewardHistory, loading } = useFetchUserRewardHistory(address)

  return (
    <PageContent withLargerMaxWidth meta={{ title: 'Active Staking Dashboard' }}>
      <Tabs
        activeKey={address === myAddress ? 'user' : ''}
        onChange={key => {
          if (key === 'general') router.push('/leaderboard')
          else if (key === 'stats') router.push('/stats')
        }}
      >
        {myAddress && <Tabs.TabPane tab='My Staking Stats' key='user' />}
        <Tabs.TabPane tab='Global Staking Stats' key='general' />
        <Tabs.TabPane tab='Polkaverse Activity' key='stats' />
      </Tabs>
      {data && (
        <div className={clsx(styles.Statistics)}>
          <ProfileCard
            variant={tabState === 'creator' ? 'pink' : 'blue'}
            address={address}
            detail={
              <Radio.Group
                className={clsx('DfRadioGroup mt-3', tabState === 'staker' && 'Blue')}
                options={[
                  { label: 'Staker', value: 'staker' },
                  { label: 'Creator', value: 'creator' },
                ]}
                onChange={e => {
                  const value = e.target.value
                  router.push(`/leaderboard/${address}?tab=${value}`, undefined, { shallow: true })
                }}
                value={tabState}
                optionType='button'
              />
            }
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
        <DfCard size='small' withShadow={false} style={{ overflowX: 'clip' }}>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>Leaderboard</span>
            <MutedSpan className='FontSmall'>
              {tabState === 'staker'
                ? 'Stakers ranked based on the amount of SUB earned with Active Staking.'
                : 'Creators ranked based on the amount of SUB earned with Active Staking.'}
            </MutedSpan>
          </div>
          <LeaderboardTable className='mt-3' role={tabState} />
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
