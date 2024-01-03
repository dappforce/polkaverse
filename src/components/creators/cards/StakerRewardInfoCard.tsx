import { Button } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import { RiHistoryFill } from 'react-icons/ri'
import Segment from 'src/components/utils/Segment'
import StakerRewardHistoryModal from '../stakers/StakerRewardHistoryModal'
import StakerRewardInfo from '../stakers/StakerRewardInfo'
import styles from './StakerRewardInfoCard.module.sass'

export default function StakerRewardInfoCard() {
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false)

  return (
    <>
      <Segment className={clsx(styles.StakerRewardInfoCard)}>
        <div className={styles.TopSection}>
          <div className='d-flex align-items-center GapNormal justify-content-between'>
            <p className={clsx(styles.Title, 'mb-0')}>Creator Staking</p>
            <Button
              type='primary'
              ghost
              style={{ height: 'auto' }}
              className='p-1'
              onClick={() => setIsOpenHistoryModal(true)}
            >
              <RiHistoryFill className='d-block' />
            </Button>
          </div>
          <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
            <a target='_blank' className={styles.Link}>
              How does it work?
            </a>
          </Link>
        </div>
        <div className={clsx(styles.BottomSection)}>
          <StakerRewardInfo />
        </div>
      </Segment>
      <StakerRewardHistoryModal
        visible={isOpenHistoryModal}
        onCancel={() => setIsOpenHistoryModal(false)}
      />
    </>
  )
}
