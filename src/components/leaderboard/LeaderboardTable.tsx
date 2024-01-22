import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { wait } from 'src/utils/promise'
import Avatar from '../profiles/address-views/Avatar'
import { Loading } from '../utils'
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
  const [isLoading, setIsLoading] = useState(false)
  const [allData, setAllData] = useState(() =>
    Array.from({ length: 10 }).map((_, idx) => ({ ...data, rank: idx + 1 })),
  )

  const loadMore = async () => {
    setIsLoading(true)
    await wait(1000)
    setAllData(prev =>
      Array.from({ length: prev.length + 10 }).map((_, idx) => ({ ...data, rank: idx + 1 })),
    )
    setIsLoading(false)
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
      {allData.map(data => (
        <div className={styles.LeaderboardRow} key={data.rank}>
          <UserRow data={data} />
        </div>
      ))}
      {isLoading ? (
        <Loading className={clsx(styles.Loading, 'py-2')} withPadding={false} />
      ) : (
        <Button className={styles.LoadMore} onClick={loadMore}>
          Load more
        </Button>
      )}
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
