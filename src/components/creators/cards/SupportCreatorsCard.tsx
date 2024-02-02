import { Button } from 'antd'
import clsx from 'clsx'
import { DfImage } from 'src/components/utils/DfImage'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './SupportCreatorsCard.module.sass'

export default function SupportCreatorsCard() {
  const sendEvent = useSendEvent()
  return (
    <div className={clsx(styles.SupportCreatorsCard)}>
      <div className={styles.Content}>
        <DfImage
          preview={false}
          src='/images/creators/subsocial-tokens.png'
          className={clsx(styles.Image)}
        />
        <p className={clsx('FontWeightSemibold FontLarge mb-2', styles.Title)}>
          Support creators
          <br />
          and earn SUB
        </p>
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          Lock tokens and like posts to generate rewards for you and creators
        </p>
        <Button
          href={getSubIdCreatorsLink()}
          block
          target='_blank'
          onClick={() =>
            sendEvent('astake_banner_add_stake', { eventSource: 'support-creators-banner' })
          }
        >
          Lock SUB
        </Button>
      </div>

      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </div>
  )
}
