import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import styles from './GetMoreSubCard.module.sass'

export type GetMoreSubCardProps = ComponentProps<'div'>

export default function GetMoreSubCard({ ...props }: GetMoreSubCardProps) {
  return (
    <Segment {...props} className={clsx(styles.GetMoreSub, props.className)}>
      <div className={styles.Content}>
        <p className={clsx(styles.Title, 'mb-2')}>Get more SUB with Active Staking</p>
        <p className='FontSmall'>Get rewarded based on your social activity</p>
        <DfImage src='/images/creators/hearts.png' className={clsx('w-100', styles.Image)} />
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
  )
}
