import { Button, Divider, Modal, Tabs } from 'antd'
import partition from 'lodash.partition'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import messages from 'src/messages'
import { useFetchSpaces, useSelectSpaces } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import {
  useFetchSpaceIdsByFollower,
  useFetchSpaceIdsByOwner,
} from 'src/rtk/features/spaceIds/spaceIdsHooks'
import { selectSpaceIdsWithRolesByAccount } from 'src/rtk/features/spaceIds/spaceIdsWithRolesByAccountSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { AccountId, AnyAccountId, DataSourceTypes, isUnlisted, SpaceData, SpaceId } from 'src/types'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import { InfiniteListByPage } from '../lists'
import { PageContent } from '../main/PageWrapper'
import { useIsSubstrateConnected } from '../substrate'
import { Loading, LoadingSpaces, toShortAddress } from '../utils'
import { getPageOfIds } from '../utils/getIds'
import { Pluralize } from '../utils/Plularize'
import { CreateSpaceButton } from './helpers'
import { ViewSpaceById } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'

const { TabPane } = Tabs

export type LoadSpacesType = {
  spacesData: SpaceData[]
  spaceIds: SpaceId[]
}

type BaseProps = {
  address: AnyAccountId
  withTitle?: boolean
}

type InnerSpacesList = {
  totalCount: number
  title?: React.ReactNode
  isMy?: boolean
  spaceProps?: ViewSpaceProps
}

type SpacesListBySpaceIdsProps = InnerSpacesList & {
  spaceIds: SpaceId[]
  withDivider?: boolean
}

const SpacesListBySpaceIds = (props: SpacesListBySpaceIdsProps) => {
  const { withDivider = false, spaceIds, totalCount, isMy, title, spaceProps } = props
  const dispatch = useAppDispatch()
  const { subsocial } = useSubsocialApi()
  const noSpaces = totalCount === 0

  const loadMoreSpaces = async (page: number, size: number) => {
    const ids = getPageOfIds(spaceIds, { page, size })

    await dispatch(fetchSpaces({ ids, api: subsocial }))

    return ids
  }

  return (
    <InfiniteListByPage
      title={title}
      totalCount={totalCount}
      getKey={spaceId => spaceId}
      renderItem={(spaceId, i) => (
        <>
          {withDivider && i > 0 && <Divider className='my-3' />}
          <ViewSpaceById spaceId={spaceId} withFollowButton preview {...spaceProps} />
        </>
      )}
      noDataDesc='No spaces found'
      noDataExt={noSpaces && isMy && <CreateSpaceButton>Create my first space</CreateSpaceButton>}
      loadMore={loadMoreSpaces}
    />
  )
}

type AccountSpacesProps = BaseProps

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const OwnedSpacesList = ({ ...props }: Omit<AccountSpacesProps, 'withTitle'>) => {
  const address = props.address.toString()
  const {
    query: { page = DEFAULT_FIRST_PAGE, size = DEFAULT_PAGE_SIZE },
  } = useRouter()

  const [unlistedSpaceIds, setUnistedSpaceIds] = useState<SpaceId[]>([])
  const { spaceIds: ownedSpaceIds, error, loading } = useFetchSpaceIdsByOwner(address)
  const spaces = useSelectSpaces(ownedSpaceIds)
  const [newUnlistedSpaces] = partition(spaces, isUnlisted)
  const connected = useIsSubstrateConnected()
  const isMy = useIsMyAddress(address)

  const followedSpaceIds =
    useAppSelector(
      state => (address ? selectSpaceIdsByFollower(state, address) : []),
      shallowEqual,
    ) || []

  const spaceIdsImEditorOf =
    useAppSelector(state => (address ? selectSpaceIdsWithRolesByAccount(state, address) : [])) || []

  const totalCount = ownedSpaceIds.length
  const unlistedCount = unlistedSpaceIds.length

  useEffect(() => {
    const set = new Set(unlistedSpaceIds)
    const newIds: SpaceId[] = []

    newUnlistedSpaces.forEach(({ struct: { id } }) => {
      if (!set.has(id)) {
        set.add(id)
        newIds.push(id)
      }
    })

    setUnistedSpaceIds(unlistedSpaceIds.concat(newIds))
  }, [newUnlistedSpaces.length, page, size])

  const allIds = useMemo(() => {
    const ids = ownedSpaceIds.concat(followedSpaceIds, spaceIdsImEditorOf, unlistedSpaceIds)
    console.log(ownedSpaceIds, followedSpaceIds, spaceIdsImEditorOf, unlistedSpaceIds, ids)
    return Array.from(new Set(ids))
  }, [ownedSpaceIds, followedSpaceIds, spaceIdsImEditorOf, unlistedSpaceIds])

  if (!connected) return <Loading label={messages.connectingToNetwork} />

  if (error) return null

  if (loading) return <LoadingSpaces />

  const hasUnlistedSpaces = unlistedSpaceIds.length > 0

  return (
    <Tabs style={{ marginTop: '-8px' }}>
      <TabPane tab={`All (${allIds.length})`} key='all'>
        <SpacesListBySpaceIds spaceIds={allIds} totalCount={allIds.length} isMy={isMy} {...props} />
      </TabPane>
      <TabPane tab={`Created (${totalCount})`} key='created'>
        <SpacesListBySpaceIds
          spaceIds={ownedSpaceIds}
          totalCount={totalCount}
          isMy={isMy}
          {...props}
        />
      </TabPane>
      <TabPane tab={`Followed (${followedSpaceIds.length})`} key='followed'>
        <SpacesListBySpaceIds
          spaceIds={followedSpaceIds}
          totalCount={followedSpaceIds.length}
          {...props}
        />
      </TabPane>
      {spaceIdsImEditorOf.length > 0 && (
        <TabPane tab={`My Roles (${spaceIdsImEditorOf.length})`} key='editor'>
          <SpacesListBySpaceIds
            spaceIds={spaceIdsImEditorOf}
            totalCount={spaceIdsImEditorOf.length}
            {...props}
          />
        </TabPane>
      )}
      {hasUnlistedSpaces && (
        <TabPane tab={`Hidden (${unlistedSpaceIds.length})`} key='hidden'>
          <SpacesListBySpaceIds spaceIds={unlistedSpaceIds} totalCount={unlistedCount} {...props} />
        </TabPane>
      )}
    </Tabs>
  )
}

export const FollowingSpacesList = (props: BaseProps) => {
  const address = props.address.toString()
  const isMyAddress = useIsMyAddress(address)

  const { spaceIds, error, loading } = useFetchSpaceIdsByFollower(address, DataSourceTypes.SQUID)

  if (error) return null

  if (loading) return <LoadingSpaces />

  const totalCount = spaceIds.length

  const title = isMyAddress
    ? `My Subscriptions (${totalCount})`
    : // TODO Improve a title: username | extension name | short addresss
      `Subscriptions of ${toShortAddress(address)}`

  return <SpacesListBySpaceIds spaceIds={spaceIds} totalCount={totalCount} title={title} />
}

export const FollowingSpacesPage = () => {
  const { address } = useRouter().query

  if (!address) return null

  return (
    <PageContent
      meta={{
        title: `Subscriptions of ${address}`,
        desc: `Spaces that ${address} follows on Subsocial`,
      }}
      withSidebar
    >
      <FollowingSpacesList address={address as string} withTitle />
    </PageContent>
  )
}

type OuterModalProps = {
  address: AccountId
  title?: React.ReactNode
  width?: number
  pluralizeTitle?: string
  renderOpenButton: (open: VoidFunction, count: number) => React.ReactNode
  spaceProps?: ViewSpaceProps
}

type InnerModalProps = Omit<OuterModalProps, 'address'> & {
  spaceIds: SpaceId[]
}

const InnerSpacesListModal = (props: InnerModalProps) => {
  const {
    spaceIds,
    title: forceTitle,
    pluralizeTitle = '',
    renderOpenButton,
    width,
    ...otherProps
  } = props
  const [visible, setVisible] = useState(false)

  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const spacesCount = spaceIds.length

  const title = forceTitle || <Pluralize count={spacesCount} singularText={pluralizeTitle} />

  if (!spaceIds) return null

  return (
    <>
      {renderOpenButton(open, spacesCount)}
      {visible && (
        <Modal
          onCancel={close}
          visible={visible}
          title={title}
          width={width}
          footer={<Button onClick={close}>Close</Button>}
        >
          <div className='ModalSpaceList'>
            <SpacesListBySpaceIds
              withDivider={true}
              spaceIds={spaceIds}
              totalCount={spacesCount}
              spaceProps={{
                withFollowButton: false,
                previewWithoutBorder: true,
                withTags: false,
              }}
              {...otherProps}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export const SpacesWithRolesByAccountModal = ({ address, ...props }: OuterModalProps) => {
  const spaceIds =
    useAppSelector(state => (address ? selectSpaceIdsWithRolesByAccount(state, address) : [])) || []
  const { loading } = useFetchSpaces({ ids: spaceIds })

  if (loading) return <Loading label='Loading spaces...' />

  return <InnerSpacesListModal spaceIds={spaceIds} {...props} />
}
