import { SpaceData } from '@subsocial/api/types'
import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { SlQuestion } from 'react-icons/sl'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { useResponsiveSize } from 'src/components/responsive'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useFetchStakeData } from 'src/rtk/features/creators/stakesHooks'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './MyStakeCard.module.sass'

export type MyStakeCardProps = {
  space: SpaceData
}

export default function MyStakeCard({ space }: MyStakeCardProps) {
  const myAddress = useMyAddress()
  const { data, loading } = useFetchStakeData(myAddress ?? '', space.id)
  const { isMobile } = useResponsiveSize()

  return (
    <Segment className={clsx(styles.CreatorStakingCard)}>
      {!isMobile && (
        <div className={styles.TopSection}>
          <p className={clsx(styles.Title, 'mb-0')}>Creator Staking</p>
          <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
            <a target='_blank' className={styles.Link}>
              How does it work?
            </a>
          </Link>
          <DfImage src='/images/databases.svg' className={styles.Image} />
        </div>
      )}
      <div
        className={clsx(
          styles.BottomSection,
          isMobile && 'flex-row d-flex justify-content-between GapNormal align-items-center',
        )}
      >
        <div className={clsx(styles.MyStake, isMobile && 'flex-column')}>
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
            'd-flex align-items-center GapTiny justify-content-center FontWeightMedium pt-1',
            !isMobile && 'mt-3',
          )}
          type='primary'
          ghost
          block={!isMobile}
          href={getSubIdCreatorsLink(space)}
          target='_blank'
        >
          Manage{isMobile ? '' : ' my stake'}
          {/* <BsBoxArrowUpRight /> */}
        </Button>
      </div>
    </Segment>
  )
}
