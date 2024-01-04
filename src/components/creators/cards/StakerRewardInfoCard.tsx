import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import { RiHistoryFill } from 'react-icons/ri'
import { DfImage } from 'src/components/utils/DfImage'
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
            <p className={clsx(styles.Title, 'mb-0')}>My Bonus Rewards</p>
          </div>
          <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
            <a target='_blank' className={styles.Link}>
              How does this work?
            </a>
          </Link>
          <DfImage preview={false} src='/images/diamond.svg' className={styles.Image} />
        </div>
        <div className={clsx(styles.BottomSection)}>
          <StakerRewardInfo className='pb-2' />
          <div
            className='d-flex justify-content-center GapMini align-items-center pb-3 ColorPrimary FontWeightMedium'
            onClick={() => setIsOpenHistoryModal(true)}
            style={{ cursor: 'pointer' }}
          >
            <RiHistoryFill />
            <span className='FontSmall'>Rewards History</span>
          </div>
        </div>
      </Segment>
      <StakerRewardHistoryModal
        visible={isOpenHistoryModal}
        onCancel={() => setIsOpenHistoryModal(false)}
      />
    </>
  )
}
