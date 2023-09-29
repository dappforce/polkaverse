import Link from 'next/link'

import { SpaceStruct } from 'src/types'
import { SpaceEditorsModal, SpaceFollowersModal } from '../profiles/AccountsListModal'
import { useResponsiveSize } from '../responsive'
import { spaceUrl } from '../urls'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import AboutSpaceLink from './AboutSpaceLink'
import { useIsMySpace } from './helpers'

type Props = {
  space: SpaceStruct
}

export const SpaceStatsRow = ({ space }: Props) => {
  const { id, postsCount } = space

  const { isMobile } = useResponsiveSize()
  const statLinkCss = 'DfStatItem'

  return (
    <div className={`${useIsMySpace(space) && 'MySpace DfStatItem'}`}>
      <Link href='/[spaceId]' as={spaceUrl(space)} legacyBehavior>
        <a className={statLinkCss}>
          <Pluralize count={postsCount || 0} singularText='Post' />
        </a>
      </Link>

      <SpaceFollowersModal
        address={id}
        pluralizeTitle='Follower'
        renderOpenButton={(open, count) =>
          !!count && (
            <div onClick={open} className={statLinkCss} style={{ cursor: 'pointer' }}>
              <Pluralize count={count} singularText='Follower' />
            </div>
          )
        }
      />

      <SpaceEditorsModal
        spaceId={id}
        pluralizeTitle='Editor'
        renderOpenButton={(open, count) =>
          !!count && (
            <div onClick={open} className={statLinkCss} style={{ cursor: 'pointer' }}>
              <Pluralize count={count} singularText='Editor' />
            </div>
          )
        }
      />

      {!isMobile && (
        <>
          <MutedSpan>
            <AboutSpaceLink className={statLinkCss} space={space} title='About' />
          </MutedSpan>

          {/* <MutedSpan className='DfStatItem'>
          <Pluralize count={score} singularText='Point' />
        </MutedSpan> */}
        </>
      )}
    </div>
  )
}

export default SpaceStatsRow
