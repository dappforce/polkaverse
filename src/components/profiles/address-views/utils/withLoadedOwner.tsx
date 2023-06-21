// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import { useMyAddress, useMyEmailAddress } from 'src/components/auth/MyAccountsContext'
import { useFetchProfileSpace, useSelectProfile } from 'src/rtk/app/hooks'
import { DataSourceTypes } from 'src/types'
import { Loading } from '../../../utils'
import { ExtendedAddressProps } from './types'

type Props = ExtendedAddressProps & {
  size?: number
  avatar?: string
  mini?: boolean
  left?: React.ReactNode
  right?: React.ReactNode
  bottom?: React.ReactNode
}

export function withProfileByAccountId<P = Props>(Component: React.ComponentType<P>) {
  return React.memo(function (props: P) {
    const { address } = props as unknown as Props
    const profile = useSelectProfile(address.toString())

    const emailAddress = useMyEmailAddress()

    return <Component {...props} owner={profile} emailAddress={emailAddress} />
  })
}

export function withFetchProfile<P = Props>(Component: React.ComponentType<P>) {
  return function (props: P) {
    const { address } = props as unknown as Props
    const { entity: owner, loading } = useFetchProfileSpace({
      id: address.toString(),
      dataSource: DataSourceTypes.SQUID,
    })

    return loading ? <Loading /> : <Component {...props} owner={owner} />
  }
}

export function withMyProfile(Component: React.ComponentType<any>) {
  return function (props: any) {
    const address = useMyAddress()
    const profile = useSelectProfile(address)

    return address ? <Component address={address} owner={profile} {...props} /> : null
  }
}
