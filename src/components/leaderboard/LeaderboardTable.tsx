import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { wait } from 'src/utils/promise'
import { InfiniteListByPage } from '../lists'
import Avatar from '../profiles/address-views/Avatar'
import { MutedSpan } from '../utils/MutedText'
import styles from './LeaderboardTable.module.sass'

export type LeaderboardTableProps = ComponentProps<'div'> & {}

type Data = { rank: number; address: string; reward: number }
const data: Data = {
  rank: 1,
  address: '3tJYxJN55FtVeZgX4WdwieZXDp4HF62TRVj11tY2aXHdrYus',
  reward: 202,
}

export default function LeaderboardTable({ ...props }: LeaderboardTableProps) {
  const [allData] = useState(() =>
    Array.from({ length: 10 }).map((_, idx) => ({ ...data, rank: idx + 1 })),
  )

  const loadMore = async () => {
    await wait(1000)
    return Array.from({ length: 10 }).map((_, idx) => ({ ...data, rank: allData.length + idx + 1 }))
  }

  return (
    <div
      {...props}
      className={clsx(styles.LeaderboardTable, 'FontWeightMedium FontSmall', props.className)}
    >
      <div className={clsx(styles.LeaderboardTitles, 'ColorMuted')}>
        <span>#</span>
        <span>Staker</span>
        <span>Rewards this week</span>
      </div>
      <InfiniteListByPage
        totalCount={100}
        getKey={(data: Data) => data.rank.toString()}
        dataSource={allData}
        loadMore={loadMore}
        renderItem={data => <UserRow data={data} key={data.rank} />}
      />
    </div>
  )
}

function UserRow({ data }: { data: Data }) {
  const profile = useSelectProfile(data.address)
  return (
    <>
      <MutedSpan>{data.rank}</MutedSpan>
      <div className='d-flex align-items-center'>
        <Avatar address={data.address} avatar={profile?.content?.image} size={32} />
        <span>{profile?.content?.name ?? 'Unnamed'}</span>
      </div>
      <span style={{ textAlign: 'right' }}>{data.reward} SUB</span>
    </>
  )
}
