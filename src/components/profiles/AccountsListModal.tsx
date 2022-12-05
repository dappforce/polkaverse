import styles from './AccountsListModal.module.sass'

import { GenericAccountId as SubstrateAccountId } from '@polkadot/types'
import { isEmptyArray } from '@subsocial/utils'
import { Divider, Modal } from 'antd'
import React, { useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { LARGE_AVATAR_SIZE, REGULAR_MODAL_HEIGHT } from 'src/config/Size.config'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { AnyAccountId, DataSourceTypes, SpaceId } from 'src/types'
import { InfiniteListByPage } from '../lists'
import { useGetSubstrateIdsById } from '../substrate/hooks/useGetIdsById'
import { Loading, toViewportHeight } from '../utils'
import { NoData } from '../utils/EmptyList'
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
}

const InnerProfilePreviewList = ({ accounts }: InnerProps) => {
  const { subsocial } = useSubsocialApi()
  const dispatch = useAppDispatch()

  const loadMoreProfiles = async (page: number, size: number) => {
    const from = (page - 1) * size
    const to = from + size
    const ids = accounts.slice(from, to).map(x => x.toString())
    await dispatch(fetchProfileSpaces({ api: subsocial, ids, dataSource: DataSourceTypes.SQUID }))
    return ids
  }

  return (
    <div
      id='profile-preview-list'
      className='overflow-auto'
      style={{ height: toViewportHeight(REGULAR_MODAL_HEIGHT) }}
    >
      <InfiniteListByPage
        className='m-0'
        scrollableTarget='profile-preview-list'
        loadMore={loadMoreProfiles}
        noDataDesc='Nothing yet'
        totalCount={accounts.length}
        loadingLabel='Loading accounts...'
        getKey={x => x.toString()}
        renderItem={item => (
          <>
            <div className='mx-3 my-2'>
              <ProfilePreviewById
                address={item}
                className='m-0'
                size={LARGE_AVATAR_SIZE}
                withFollowButton
              />
            </div>
            <Divider className='m-0' />
          </>
        )}
      />
    </div>
  )
}

const ProfilePreviewList = (props: InnerProps) => {
  if (!props.accounts || isEmptyArray(props.accounts))
    return <NoData description='No accounts yet...' />

  return <InnerProfilePreviewList {...props} />
}

const InnerAccountsListModal = (props: InnerProps) => {
  const { accounts, title, pluralizeTitle = '', renderOpenButton } = props
  const [visible, setVisible] = useState(false)

  const open = () => setVisible(true)
  const close = () => setVisible(false)
  const accountCount = accounts.length

  if (!accounts) return <Loading label='Accounts loading...' />
  return (
    <>
      {renderOpenButton(open, accountCount)}
      {visible && (
        <Modal
          onCancel={close}
          visible={visible}
          centered
          title={title || <Pluralize count={accountCount} singularText={pluralizeTitle} />}
          className={styles.AccountsListModal}
          footer={null}
        >
          <ProfilePreviewList {...props} />
        </Modal>
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

  if (loading) return null

  return <InnerAccountsListModal {...props} accounts={entities} />
}
