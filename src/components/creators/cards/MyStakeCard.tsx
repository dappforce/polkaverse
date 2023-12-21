import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { BsBoxArrowUpRight } from 'react-icons/bs'
import { SlQuestion } from 'react-icons/sl'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useFetchStakeData } from 'src/rtk/features/stakes/stakesHooks'
import styles from './MyStakeCard.module.sass'

export type MyStakeCardProps = {
  creatorSpaceId: string
}

export default function MyStakeCard({ creatorSpaceId }: MyStakeCardProps) {
  const myAddress = useMyAddress()
  const { data, loading } = useFetchStakeData(myAddress ?? '', creatorSpaceId)

  return (
    <Segment className={clsx(styles.CreatorStakingCard)}>
      <div className={styles.TopSection}>
        <p className={clsx(styles.Title, 'mb-0')}>Creator Staking</p>
        <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
          <a className={styles.Link}>How does it work?</a>
        </Link>
        <DfImage src='/images/databases.svg' className={styles.Image} />
      </div>
      <div className={styles.BottomSection}>
        <div className={styles.MyStake}>
          <div className='FontSmall ColorMuted d-flex align-items-center GapMini'>
            <span>My Stake</span>
            <SlQuestion className={clsx('FontTiny', styles.HelpIcon)} />
          </div>
          {loading ? (
            <Skeleton round paragraph={false} className={styles.Skeleton} />
          ) : (
            <span className='FontWeightMedium'>
              <FormatBalance value={data?.stakeAmount} isShort decimals={10} currency='SUB' />
            </span>
          )}
        </div>
        <Button
          className={clsx(
            'd-flex align-items-center GapTiny justify-content-center mt-3 FontWeightMedium',
          )}
          type='primary'
          ghost
          block
        >
          Manage my stake
          <BsBoxArrowUpRight />
        </Button>
      </div>
    </Segment>
  )
}
