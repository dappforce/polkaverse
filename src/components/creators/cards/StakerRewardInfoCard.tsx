import clsx from 'clsx'
import Link from 'next/link'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import StakerRewardInfo from '../stakers/StakerRewardInfo'
import styles from './StakerRewardInfoCard.module.sass'

export default function StakerRewardInfoCard() {
  return (
    <Segment className={clsx(styles.StakerRewardInfoCard)}>
      <div className={styles.TopSection}>
        <div className='d-flex align-items-center GapNormal justify-content-between'>
          <p className={clsx(styles.Title, 'mb-0')}>Active Staking</p>
        </div>
        <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
          <a target='_blank' className={styles.Link}>
            How does this work?
          </a>
        </Link>
        <DfImage preview={false} src='/images/diamond.svg' className={styles.Image} />
      </div>
      <div className={clsx(styles.BottomSection)}>
        <StakerRewardInfo />
      </div>
    </Segment>
  )
}
