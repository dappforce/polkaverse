import clsx from 'clsx'
import Link from 'next/link'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { activeStakingLinks } from 'src/utils/links'
import StakerRewardInfo from './StakerRewardInfo'
import styles from './StakerRewardInfoCard.module.sass'

export default function StakerRewardInfoCard() {
  const sendEvent = useSendEvent()
  return (
    <Segment className={clsx(styles.StakerRewardInfoCard)}>
      <div className={styles.TopSection}>
        <div className='d-flex align-items-center GapNormal justify-content-between'>
          <p className={clsx(styles.Title, 'mb-0')}>Active Staking</p>
        </div>
        <Link href={activeStakingLinks.learnMore} passHref>
          <a
            target='_blank'
            className={styles.Link}
            onClick={() => sendEvent('astake_banner_learn_more', { eventSource: 'rewardInfo' })}
          >
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
