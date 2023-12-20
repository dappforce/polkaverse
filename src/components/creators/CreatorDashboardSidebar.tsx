import { Button } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { BsBoxArrowUpRight } from 'react-icons/bs'
import { SlQuestion } from 'react-icons/sl'
import { DfImage } from '../utils/DfImage'
import Segment from '../utils/Segment'
import styles from './CreatorDashboardSidebar.module.sass'
import StakeSubBanner from './StakeSubBanner'

export type CreatorDashboardSidebarProps = ComponentProps<'div'>

export default function CreatorDashboardSidebar({ ...props }: CreatorDashboardSidebarProps) {
  return (
    <div className='d-flex flex-column GapNormal'>
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
              'd-flex align-items-center GapTiny justify-content-center mt-3',
              styles.Button,
            )}
            block
          >
            Manage my stake
            <BsBoxArrowUpRight />
          </Button>
        </div>
      </Segment>
      <Segment className={styles.GetMoreSub}>
        <div className={styles.Content}>
          <p className={clsx(styles.Title, 'mb-2')}>Get more SUB with Active Staking</p>
          <p className='FontSmall'>Get rewarded based on your social activity</p>
          <DfImage src='/images/hearts.png' className={clsx('w-100', styles.Image)} />
          <div className='d-flex flex-column GapSmall'>
            <Button
              className={clsx(
                'd-flex align-items-center GapTiny justify-content-center FontWeightMedium',
                styles.Button,
              )}
              block
            >
              How does it work?
            </Button>
            <Button
              type='ghost'
              className={clsx(
                'd-flex align-items-center GapTiny justify-content-center FontWeightMedium',
                styles.Button,
                styles.OutlineButton,
              )}
              block
            >
              Discuss this feature
            </Button>
          </div>
        </div>
        <div className={styles.Gradient1} />
        <div className={styles.Gradient2} />
      </Segment>
      <StakeSubBanner />
    </div>
  )
}
