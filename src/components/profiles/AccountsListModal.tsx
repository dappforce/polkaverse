import styles from './AccountsListModal.module.sass'

import { GenericAccountId as SubstrateAccountId } from '@polkadot/types'
import { isEmptyArray } from '@subsocial/utils'
import { Divider, Tabs } from 'antd'
import clsx from 'clsx'
import React, { useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useFetchSpaceIdsByFollower } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { AnyAccountId, DataSourceTypes, SpaceId } from 'src/types'
import { isValidAddress } from 'src/utils/address'
import { InfiniteListByPage } from '../lists'
import { LineSpacePreview } from '../spaces/LineSpacePreview'
import { useGetSubstrateIdsById } from '../substrate/hooks/useGetIdsById'
import { Loading } from '../utils'
import CustomModal from '../utils/CustomModal'
import { Pluralize } from '../utils/Plularize'
import { ProfilePreviewById } from './address-views'

type OuterProps = {
  address: AnyAccountId
  title?: React.ReactNode
  pluralizeTitle?: string
  renderOpenButton: (open: VoidFunction, count: number) => React.ReactNode
}

type InnerProps = Omit<OuterProps, 'address'> & {
  accounts: AnyAccountId[]
  spaceIds?: string[]
}

type InnerProfilePreviewListProps = {
  ids: (AnyAccountId | string)[]
  noDataDesc: string
  loadingLabel: string
  scrollableTarget: string
  className?: string
}
const InnerProfilePreviewList = ({
  ids,
  noDataDesc,
  loadingLabel,
  scrollableTarget,
  className,
}: InnerProfilePreviewListProps) => {
  const { subsocial } = useSubsocialApi()
  const dispatch = useAppDispatch()

  const loadMoreProfiles = async (page: number, size: number) => {
    const from = (page - 1) * size
    const to = from + size
    const slicedIds = ids.slice(from, to).map(x => x.toString())
    const fetchedAccounts: string[] = []
    const fetchedSpaceIds: string[] = []
    slicedIds.forEach(id => {
      if (isValidAddress(id)) fetchedAccounts.push(id)
      else fetchedSpaceIds.push(id)
    })
    if (fetchedAccounts.length > 0) {
      await dispatch(
        fetchProfileSpaces({
          api: subsocial,
          ids: fetchedAccounts,
          dataSource: DataSourceTypes.SQUID,
        }),
      )
    }
    if (fetchedSpaceIds.length > 0) {
      await dispatch(
        fetchSpaces({ api: subsocial, ids: fetchedSpaceIds, dataSource: DataSourceTypes.SQUID }),
      )
    }
    return slicedIds
  }

  return (
    <InfiniteListByPage
      className={clsx('m-0', className)}
      loadMore={loadMoreProfiles}
      noDataDesc={noDataDesc}
      totalCount={ids.length}
      loadingLabel={loadingLabel}
      scrollableTarget={scrollableTarget}
      getKey={x => x.toString()}
      renderItem={item => (
        <>
          <div className='my-2'>
            {isValidAddress(item) ? (
              <ProfilePreviewById address={item} className='m-0' size={46} withFollowButton />
            ) : (
              <LineSpacePreview withFollowButton spaceId={item} />
            )}
          </div>
          <Divider className='m-0' />
        </>
      )}
    />
  )
}

const ProfilePreviewList = (props: InnerProps) => {
  const renderAccountsList = (className?: string) => (
    <InnerProfilePreviewList
      className={className}
      scrollableTarget='account-list-modal'
      noDataDesc='No accounts followed yet...'
      loadingLabel='Loading followed accounts...'
      ids={props.accounts}
    />
  )
  const renderSpacesList = (className?: string) => (
    <InnerProfilePreviewList
      className={className}
      scrollableTarget='account-list-modal'
      noDataDesc='No spaces followed yet...'
      loadingLabel='Loading followed spaces...'
      ids={props.spaceIds ?? []}
    />
  )

  if (!isEmptyArray(props.accounts) && !isEmptyArray(props.spaceIds)) {
    return (
      <Tabs>
        <Tabs.TabPane tab={`Accounts (${props.accounts.length})`} key='accounts'>
          {renderAccountsList('pt-1')}
        </Tabs.TabPane>
        <Tabs.TabPane tab={`Spaces (${props.spaceIds?.length ?? 0})`} key='spaces'>
          {renderSpacesList('pt-1')}
        </Tabs.TabPane>
      </Tabs>
    )
  }

  if (!isEmptyArray(props.accounts)) {
    return renderAccountsList()
  } else if (!isEmptyArray(props.spaceIds)) {
    return renderSpacesList()
  }
  return null
}

const InnerAccountsListModal = (props: InnerProps) => {
  const { accounts, title, pluralizeTitle = '', renderOpenButton } = props
  const [visible, setVisible] = useState(false)

  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const accountCount = accounts.length + (props.spaceIds?.length ?? 0)

  if (!accounts) return <Loading label='Accounts loading...' />
  return (
    <>
      {renderOpenButton(open, accountCount)}
      {visible && (
        <CustomModal
          fullHeight
          onCancel={close}
          visible={visible}
          contentElementId='account-list-modal'
          centered
          title={title || <Pluralize count={accountCount} singularText={pluralizeTitle} />}
          className={styles.AccountsListModal}
        >
          <ProfilePreviewList {...props} />
        </CustomModal>
      )}
    </>
  )
}

export const SpaceFollowersModal = (props: OuterProps) => {
  const { entities, loading } = useGetSubstrateIdsById<SubstrateAccountId>({
    pallet: 'spaceFollows',
    method: 'spaceFollowers',
    id: props.address.toString(),
  })

  if (loading) return null

  return <InnerAccountsListModal {...props} accounts={entities} />
}

type SpaceEditorsModalProps = Omit<OuterProps, 'address'> & {
  spaceId: SpaceId
}

export const SpaceEditorsModal = ({ spaceId, ...props }: SpaceEditorsModalProps) => {
  const { spaceEditors, loading } = useFetchSpaceEditors(spaceId, DataSourceTypes.SQUID)

  if (loading || !spaceEditors) return null

  return <InnerAccountsListModal {...props} accounts={spaceEditors} />
}

export const AccountFollowersModal = (props: OuterProps) => {
  const { entities, loading } = useGetSubstrateIdsById<SubstrateAccountId>({
    pallet: 'accountFollows',
    method: 'accountFollowers',
    id: props.address.toString(),
  })

  if (loading) return null

  return <InnerAccountsListModal {...props} accounts={entities} />
}

const useAccountsFollowedByAccount = (address: AnyAccountId) =>
  useGetSubstrateIdsById<SubstrateAccountId>({
    pallet: 'accountFollows',
    method: 'accountsFollowedByAccount',
    id: address.toString(),
  })

export const AccountFollowingModal = (props: OuterProps) => {
  const { entities, loading } = useAccountsFollowedByAccount(props.address)
  const { spaceIds, loading: loadingFollowingSpaces } = useFetchSpaceIdsByFollower(
    props.address.toString(),
    DataSourceTypes.SQUID,
  )

  if (loading || loadingFollowingSpaces) return null

  return <InnerAccountsListModal {...props} spaceIds={spaceIds} accounts={entities} />
}
