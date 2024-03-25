import { Button } from 'antd'
import { useState } from 'react'
import { SpaceStruct } from 'src/types'
import { SpaceEditorsModal, SpaceFollowersModal } from '../profiles/AccountsListModal'
import CustomLink from '../referral/CustomLink'
import { useResponsiveSize } from '../responsive'
import { spaceUrl } from '../urls'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import AboutSpaceLink from './AboutSpaceLink'
import { useIsMySpace } from './helpers'
import EditSpacePermissionsModal from './permissions/editSpacePermissionsModal'

type Props = {
  space: SpaceStruct
}

type EditorsModalState = 'editors' | 'manage-editors'

export const SpaceStatsRow = ({ space }: Props) => {
  const { id, postsCount } = space
  const [editorsModalState, setEditorsModalState] = useState<EditorsModalState>('editors')
  const [open, setOpen] = useState(false)

  const isMySpace = useIsMySpace(space)

  const { isMobile } = useResponsiveSize()
  const statLinkCss = 'DfStatItem'

  const onManageEditorsClick = () => {
    setEditorsModalState('manage-editors')
    setOpen(true)
  }

  return (
    <div className={`${isMySpace && 'MySpace DfStatItem'}`}>
      <CustomLink href='/[spaceId]' as={spaceUrl(space)}>
        <a className={statLinkCss}>
          <Pluralize count={postsCount || 0} singularText='Post' />
        </a>
      </CustomLink>

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

      {editorsModalState === 'editors' ? (
        <SpaceEditorsModal
          spaceId={id}
          pluralizeTitle='Editor'
          footer={
            isMySpace ? (
              <Button type='primary' block size='large' ghost onClick={onManageEditorsClick}>
                Manage editors
              </Button>
            ) : undefined
          }
          renderOpenButton={(open, count) =>
            !!count && (
              <div onClick={open} className={statLinkCss} style={{ cursor: 'pointer' }}>
                <Pluralize count={count} singularText='Editor' />
              </div>
            )
          }
        />
      ) : (
        <EditSpacePermissionsModal
          open={open}
          closeModal={() => {
            setOpen(false)
            setEditorsModalState('editors')
          }}
          space={space}
        />
      )}

      {!isMobile && (
        <>
          <MutedSpan>
            <AboutSpaceLink className={statLinkCss} space={space} title='About' />
          </MutedSpan>
        </>
      )}
    </div>
  )
}

export default SpaceStatsRow
