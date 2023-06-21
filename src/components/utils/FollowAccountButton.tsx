// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { GenericAccountId } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import { registry } from '@subsocial/api/utils/registry'
import { notDef } from '@subsocial/utils'
import { shallowEqual } from 'react-redux'
import { useCreateReloadAccountIdsByFollower, useCreateReloadProfile } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { selectAccountIdsByFollower } from 'src/rtk/features/profiles/followedAccountIdsSlice'
import { useIsMyAddress, useMyAddress } from '../auth/MyAccountsContext'
import { FollowButtonStub } from './FollowButtonStub'
import TxButton from './TxButton'

type FollowAccountButtonProps = {
  address: string | AccountId
  className?: string
}

function FollowAccountButton(props: FollowAccountButtonProps) {
  const { address, className = '' } = props
  const myAddress = useMyAddress()

  // TODO This selector should be moved to the upper list component to improve performance.
  const followedAccountIds =
    useAppSelector(
      state => (myAddress ? selectAccountIdsByFollower(state, myAddress) : []),
      shallowEqual,
    ) || []
  const isFollower = followedAccountIds.indexOf(address.toString()) >= 0
  const reloadProfile = useCreateReloadProfile()
  const reloadAccountIdsByFollower = useCreateReloadAccountIdsByFollower()
  const isMyAddress = useIsMyAddress(address)

  // I'm signed in and I am looking at my account
  if (myAddress && isMyAddress) return null

  // I'm not signed in
  if (!myAddress) return <FollowButtonStub />

  const accountId = new GenericAccountId(registry, address)

  const buildTxParams = () => [accountId]

  const loading = notDef(isFollower)

  const label = isFollower ? 'Unfollow' : 'Follow'

  return (
    <span className={className}>
      <TxButton
        className='DfFollowAccountButton'
        type={isFollower ? 'default' : 'primary'}
        loading={loading}
        ghost={!isFollower}
        label={loading ? undefined : label}
        tx={isFollower ? 'accountFollows.unfollowAccount' : 'accountFollows.followAccount'}
        params={buildTxParams}
        onSuccess={() => {
          reloadAccountIdsByFollower(myAddress)
          reloadProfile({ id: myAddress })
          reloadProfile({ id: address.toString() })
        }}
        withSpinner
      />
    </span>
  )
}

export default FollowAccountButton
