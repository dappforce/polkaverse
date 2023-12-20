import { Button } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { BsBoxArrowUpRight } from 'react-icons/bs'
import { SlQuestion } from 'react-icons/sl'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import styles from './MyStakeCard.module.sass'

export type MyStakeCardProps = ComponentProps<'div'>

export default function MyStakeCard({ ...props }: MyStakeCardProps) {
  return (
    <Segment {...props} className={clsx(props.className, styles.CreatorStakingCard)}>
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
          <span>800K SUB</span>
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
