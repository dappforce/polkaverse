// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isDef } from '@subsocial/utils'
import Error from 'next/error'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { HasSpaceIdOrHandle, newPostUrl } from 'src/components/urls'
import { isHidden } from 'src/components/utils'
import NoData from 'src/components/utils/EmptyList'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'
import { isBlockedSpace } from 'src/moderation'
import { SpaceData, SpaceStruct } from 'src/types'

export type SpaceProps = {
  space: SpaceStruct
}

export const useIsMySpace = (space?: SpaceStruct) => useIsMyAddress(space?.ownerId) && isDef(space)

export const useIsUnlistedSpace = (data?: SpaceData) =>
  !useIsMySpace(data?.struct) && (isHidden(data?.struct) || (data && isBlockedSpace(data?.struct)))

export const createNewPostLinkProps = (space?: HasSpaceIdOrHandle) => ({
  href: space ? '/[spaceId]/posts/new' : '/posts/new',
  as: newPostUrl(space),
})

type StatusProps = EntityStatusProps & {
  space: SpaceStruct
}

export const HiddenSpaceAlert = (props: StatusProps) => (
  <HiddenEntityPanel struct={props.space} kind='space' {...props} />
)

export const SpaceNotFound = () => <NoData description='Space not found' />

export const SpaceNotFountPage = () => <Error statusCode={404} title='Space not found' />
