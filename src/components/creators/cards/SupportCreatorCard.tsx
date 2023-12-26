import { Button } from 'antd'
import clsx from 'clsx'
import { DfImage } from 'src/components/utils/DfImage'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './SupportCreatorsCard.module.sass'

export default function SupportCreatorsCard() {
  return (
    <div className={clsx(styles.SupportCreatorsCard)}>
      <div className={styles.Content}>
        <span className={clsx('FontWeightSemibold FontLarge mb-2', styles.Title)}>
          Support creators and earn SUB
        </span>
        <span className={clsx(styles.Subtitle)}>
          Generate rewards for both you and this creator by staking towards them
        </span>
        <DfImage src='/images/creators/subsocial-tokens-pink.png' className={clsx(styles.Image)} />
        <Button href={getSubIdCreatorsLink()} target='_blank'>
          Stake
        </Button>
      </div>

      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </div>
  )
}
