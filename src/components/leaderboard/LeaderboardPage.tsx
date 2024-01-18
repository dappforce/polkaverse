import { IoPeople } from 'react-icons/io5'
import { SlQuestion } from 'react-icons/sl'
import { PageContent } from '../main/PageWrapper'
import DfCard from '../utils/cards/DfCard'
import { MutedSpan } from '../utils/MutedText'

export default function LeaderboardPage() {
  return (
    <PageContent withLargerMaxWidth meta={{ title: 'Active Staking Dashboard' }}>
      <div className='d-flex align-items-end justify-content-between'>
        <h1 className='DfUnboundedTitle ColorNormal mb-0'>Active Staking Dashboard</h1>
        <span>Role:</span>
      </div>
      <div className='mt-4 GapBig' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <DfCard
          className='d-flex flex-column GapSmall align-items-center'
          variant='info'
          withShadow={false}
          style={{ gridRow: 'span 2' }}
        >
          <div
            className='rounded-circle d-flex align-items-center justify-content-center'
            style={{ background: 'white', width: '88px', height: '88px' }}
          >
            <IoPeople style={{ fontSize: '42px', color: '#5089F8' }} />
          </div>
          <div className='d-flex flex-column align-items-center'>
            <span className='FontBig FontWeightSemibold'>Total Activity</span>
            <MutedSpan>this week</MutedSpan>
          </div>
        </DfCard>
        <StatisticCard />
        <StatisticCard />
        <StatisticCard />
        <StatisticCard />
      </div>
      <div className='mt-4 GapLarge' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <TopUsersTable />
        <TopUsersTable />
      </div>
    </PageContent>
  )
}

function TopUsersTable() {
  return (
    <DfCard withShadow={false} className='d-flex flex-column'>
      <span className='FontWeightSemibold FontSemilarge'>Top Stakers this week</span>
      <MutedSpan className='FontSmall mt-1'>
        Stakers ranked based on the amount of SUB earned with Active Staking.
      </MutedSpan>
      <div className='mt-3'>asdfasdfdf</div>
    </DfCard>
  )
}

function StatisticCard() {
  return (
    <DfCard size='small' className='d-flex flex-column GapMini' withShadow={false}>
      <div className='d-flex align-items-center ColorMuted GapTiny'>
        <span className='FontSmall'>Total posts liked</span>
        <SlQuestion className='FontTiny' />
      </div>
      <div className='d-flex align-items-center justify-content-between GapSmall mt-auto'>
        <span className='FontWeightMedium FontBig'>125</span>
        <MutedSpan>+25 today</MutedSpan>
      </div>
    </DfCard>
  )
}
