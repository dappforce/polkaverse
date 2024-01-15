import clsx from 'clsx'
import { ComponentProps } from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { SpaceAvatar } from '../spaces/helpers'
import { MutedSpan } from '../utils/MutedText'
import Segment from '../utils/Segment'

export type TopMembersCardProps = ComponentProps<'div'> & {}

export default function TopMembersCard({ ...props }: TopMembersCardProps) {
  return (
    <Segment {...props} className={clsx(props.className, 'p-3')}>
      <div className='d-flex align-items-center FontWeightSemibold GapMini'>
        <span>Top members this week</span>
        <HiOutlineInformationCircle />
      </div>
      <div className='d-flex flex-column FontSmall mt-2'>
        <MutedSpan className='FontWeightMedium'>Stakers</MutedSpan>
        <CreatorInfo />
      </div>
    </Segment>
  )
}

function CreatorInfo() {
  const space = useSelectSpace('11157')
  if (!space) return null

  return (
    <div className='d-flex align-items-center'>
      <div className='position-relative'>
        <SpaceAvatar space={space.struct} avatar={space.content?.image} size={34} />
      </div>
      <div className='d-flex flex-column'>
        <span className='FontWeightMedium'>Adam Smith</span>
        <MutedSpan>245.45 SUB</MutedSpan>
      </div>
    </div>
  )
}
