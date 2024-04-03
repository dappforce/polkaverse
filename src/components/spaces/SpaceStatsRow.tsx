import { useApolloClient } from '@apollo/client'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { getPostsCount } from 'src/graphql/apis'
import { useGetActivityCounts } from 'src/graphql/hooks'
import { SpaceStruct } from 'src/types'
import { useIsMyAddress } from '../auth/MyAccountsContext'
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
  isProfileSpace: boolean
}

type EditorsModalState = 'editors' | 'manage-editors'

export const SpaceStatsRow = ({ space, isProfileSpace }: Props) => {
  const { id } = space
  const getActivityCounts = useGetActivityCounts()

  const address = space?.ownerId
  const isMyAddress = useIsMyAddress(address)
  const [editorsModalState, setEditorsModalState] = useState<EditorsModalState>('editors')
  const [open, setOpen] = useState(false)
  const [counts, setCounts] = useState<number | undefined>(undefined)
  const client = useApolloClient()

  const isMySpace = useIsMySpace(space)

  useEffect(() => {
    setCounts(undefined)
    ;(async () => {
      if (!address) return

      if (isProfileSpace) {
        const counts = await getActivityCounts({
          address,
          withHidden: isMySpace || isMyAddress,
          spaceId: id,
        })

        setCounts(counts.postsCount)
      } else {
        const variables = {
          where: {
            space: { id_eq: space.id },
            ...(isMySpace || isMyAddress ? {} : { hidden_eq: false }),
          },
        }
        const postsCount = await getPostsCount(client, variables)
        setCounts(postsCount)
      }
    })()
  }, [address, isMySpace, isMyAddress, isProfileSpace])

  const { isMobile } = useResponsiveSize()
  const statLinkCss = 'DfStatItem'

  const onManageEditorsClick = () => {
    setEditorsModalState('manage-editors')
    setOpen(true)
  }

  const postsCount = counts

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
