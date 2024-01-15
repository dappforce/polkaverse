import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps, CSSProperties } from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import { IoChevronForward } from 'react-icons/io5'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { useIsMobileWidthOrDevice } from '../responsive'
import { SpaceAvatar } from '../spaces/helpers'
import { MutedSpan } from '../utils/MutedText'
import Segment from '../utils/Segment'

export type TopMembersCardProps = ComponentProps<'div'> & {}

export default function TopMembersCard({ ...props }: TopMembersCardProps) {
  const isMobile = useIsMobileWidthOrDevice()

  const seeMoreButton = (
    <Button
      type='primary'
      ghost
      className='p-0 GapMini d-flex align-items-center'
      style={{ height: 'auto', border: 'none', boxShadow: 'none' }}
    >
      <span>See more</span>
      <IoChevronForward />
    </Button>
  )

  const content = (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <div className='d-flex align-items-center FontWeightSemibold GapMini'>
          <span>Top members this week</span>
          <HiOutlineInformationCircle />
        </div>
        {isMobile && seeMoreButton}
      </div>
      <div
        className={clsx('mt-2', isMobile && 'GapNormal')}
        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr' }}
      >
        <div className='d-flex flex-column FontSmall' style={{ minWidth: 0 }}>
          <MutedSpan className='FontWeightMedium mb-1'>Stakers</MutedSpan>
          <div className='d-flex flex-column GapTiny'>
            <CreatorInfo rank={1} />
            <CreatorInfo rank={2} />
            <CreatorInfo rank={3} />
          </div>
        </div>
        <div
          className={clsx('d-flex flex-column FontSmall', !isMobile && 'mt-3 pt-2')}
          style={{ borderTop: !isMobile ? '1px solid #E2E8F0' : 'none', minWidth: 0 }}
        >
          <MutedSpan className='FontWeightMedium mb-1'>Creators</MutedSpan>
          <div className='d-flex flex-column GapTiny'>
            <CreatorInfo rank={1} />
            <CreatorInfo rank={2} />
            <CreatorInfo rank={3} />
          </div>
        </div>
      </div>
      {!isMobile && <div className='d-flex justify-content-center mt-2'>{seeMoreButton}</div>}
    </>
  )

  if (isMobile) {
    return (
      <div {...props} className={clsx(props.className, 'p-3 pt-2.5')}>
        {content}
      </div>
    )
  }

  return (
    <Segment
      {...props}
      style={{ background: 'white', ...props.style }}
      className={clsx(props.className, 'p-3')}
    >
      {content}
    </Segment>
  )
}

function CreatorInfo({ rank }: { rank: number }) {
  const space = useSelectSpace('11157')
  if (!space) return null

  return (
    <div className='d-flex align-items-center'>
      <div className='position-relative'>
        <SpaceAvatar space={space.struct} avatar={space.content?.image} size={34} />
        {[1, 2, 3].includes(rank) && (
          <Medal
            className='position-absolute FontTiny'
            style={{ bottom: -2, right: 6 }}
            rank={rank as 1 | 2 | 3}
          />
        )}
      </div>
      <div className='d-flex flex-column' style={{ minWidth: 0 }}>
        <span
          className='FontWeightMedium'
          style={{
            minWidth: 0,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          Adam Smith Adam Smith Adam Smith Adam Smith Adam Smith
        </span>
        <MutedSpan>245.45 SUB</MutedSpan>
      </div>
    </div>
  )
}

function Medal({ rank, ...props }: ComponentProps<'div'> & { rank: 1 | 2 | 3 }) {
  const rankStyles: Record<number, CSSProperties> = {
    1: {
      backgroundColor: '#FCDF40',
      color: '#887304',
    },
    2: {
      backgroundColor: '#D4D4D4',
      color: '#8C8C8C',
    },
    3: {
      backgroundColor: '#DEA368',
      color: '#9B5E23',
    },
  }

  const style: CSSProperties = {
    ...rankStyles[rank],
    border: '1px solid white',
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
  }

  return (
    <div
      {...props}
      style={{ ...style, ...props.style }}
      className={clsx(
        'FontWeightMedium d-flex align-items-center justify-content-center',
        props.className,
      )}
    >
      <span>{rank}</span>
    </div>
  )
}
