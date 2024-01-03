import { ModalProps } from 'antd'
import CustomModal from 'src/components/utils/CustomModal'

export type StakerRewardHistoryModalProps = Pick<ModalProps, 'visible' | 'onCancel'>

export default function StakerRewardHistoryModal({
  onCancel,
  visible,
}: StakerRewardHistoryModalProps) {
  return (
    <CustomModal title='Active Staking History' visible={visible} onCancel={onCancel}>
      <div className='d-flex flex-column GapSmall'>
        <div className='d-flex align-items-center justify-content-between GapSmall'>
          <span className='ColorMuted FontSmall'>01.01.24 - 07.01.24</span>
          <span className='FontWeightSemibold'>+ 34.59 SUB</span>
        </div>
        <div className='d-flex align-items-center justify-content-between GapSmall'>
          <span className='ColorMuted FontSmall'>01.01.24 - 07.01.24</span>
          <span className='FontWeightSemibold'>+ 34.59 SUB</span>
        </div>
      </div>
    </CustomModal>
  )
}
