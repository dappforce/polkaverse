import clsx from 'clsx'
import { ReactNode } from 'react-markdown'
import { GeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'
import { useFetchGeneralStatistics } from 'src/rtk/features/leaderboard/hooks'
import { FormatBalance } from '../common/balances'
import { PageContent } from '../main/PageWrapper'
import DfCard from '../utils/cards/DfCard'
import { MutedSpan } from '../utils/MutedText'
import ProfileCard from './common/ProfileCard'
import StatisticCard from './common/StatisticCard'
import styles from './GeneralLeaderboardPage.module.sass'
import LeaderboardTable from './LeaderboardTable'

const stats: { title: string; value: (data: GeneralStatistics) => ReactNode; tooltip: string }[] = [
  {
    title: 'Total posts liked',
    value: data => data.postsLiked,
    tooltip: 'The total number of individual posts that were liked at least one time this week',
  },
  {
    title: 'Total SUB earned by stakers',
    value: data => (
      <FormatBalance
        withMutedDecimals={false}
        precision={2}
        value={data.stakersEarnedTotal ?? '0'}
        currency='SUB'
        decimals={10}
      />
    ),
    tooltip: 'The total amount of SUB rewards earned by stakers on Subsocial this week',
  },
  {
    title: 'Total creators liked',
    value: data => data.creatorsLiked,
    tooltip: 'The total number of individual creators that had one of their posts liked this week',
  },
  {
    title: 'Total SUB earned by creators',
    value: data => (
      <FormatBalance
        withMutedDecimals={false}
        precision={2}
        value={data.creatorsEarnedTotal ?? '0'}
        currency='SUB'
        decimals={10}
      />
    ),
    tooltip: 'The total amount of SUB rewards earned by creators on Subsocial this week',
  },
]

export type GeneralLeaderboardPageProps = {}
export default function GeneralLeaderboardPage({}: GeneralLeaderboardPageProps) {
  const { data } = useFetchGeneralStatistics()

  return (
    <PageContent withLargerMaxWidth meta={{ title: 'Active Staking Dashboard' }}>
      <h1 className='DfUnboundedTitle ColorNormal mb-0 FontBig'>Active Staking Dashboard</h1>
      {data && (
        <div className={clsx(styles.Statistics)}>
          <ProfileCard title='Total Activity' subtitle='this week' />
          {stats.map(stat => (
            <StatisticCard
              tooltip={stat.tooltip}
              title={stat.title}
              value={stat.value(data)}
              key={stat.title}
            />
          ))}
        </div>
      )}
      <div className={clsx(styles.Leaderboards)}>
        <DfCard size='small' withShadow={false} className='sm-hidden'>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>Leaderboard</span>
            <MutedSpan className='FontSmall'>
              Stakers ranked based on the amount of SUB earned with Active Staking.
            </MutedSpan>
          </div>
          <LeaderboardTable className='mt-3' />
        </DfCard>
        <DfCard size='small' withShadow={false}>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>Leaderboard</span>
            <MutedSpan className='FontSmall'>
              Stakers ranked based on the amount of SUB earned with Active Staking.
            </MutedSpan>
          </div>
          <LeaderboardTable className='mt-3' />
        </DfCard>
      </div>
    </PageContent>
  )
}
