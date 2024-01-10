import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { activeStakingLinks } from 'src/utils/links'
import styles from './GetMoreSubCard.module.sass'

export type GetMoreSubCardProps = ComponentProps<'div'>

export default function GetMoreSubCard({ ...props }: GetMoreSubCardProps) {
  const sendEvent = useSendEvent()

  return (
    <Segment {...props} className={clsx(styles.GetMoreSub, props.className)}>
      <div className={styles.Content}>
        <DfImage preview={false} src='/images/creators/hearts.png' className={clsx(styles.Image)} />
        <p className={clsx(styles.Title, 'mb-2')}>Get more SUB with Active Staking</p>
        <p className={clsx(styles.Subtitle)}>Get rewarded based on your social activity</p>
        <div className='d-flex flex-column GapSmall'>
          <Button
            className={clsx(
              'd-flex align-items-center GapTiny justify-content-center',
              styles.Button,
            )}
            block
            href={activeStakingLinks.learnMore}
            target='_blank'
            onClick={() => sendEvent('astake_banner_learn_more', { eventSource: 'getMoreSubCard' })}
          >
            How does it work?
          </Button>
          <Button
            type='ghost'
            className={clsx(
              'd-flex align-items-center GapTiny justify-content-center',
              styles.Button,
              styles.OutlineButton,
            )}
            href={activeStakingLinks.discuss()}
            target='_blank'
            block
          >
            Discuss this feature
          </Button>
        </div>
      </div>
      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </Segment>
  )
}
