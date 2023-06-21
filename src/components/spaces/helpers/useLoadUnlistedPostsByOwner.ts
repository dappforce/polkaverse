// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { PostId, PostWithSomeDetails, SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct
  postIds: PostId[]
}

const log = newLogger('useLoadUnlistedPostsByAddress')

export function useLoadUnlistedPostsByAddress({ space, postIds }: Props) {
  const isMySpaces = useIsMyAddress(space.ownerId)
  const canHidePost = useHasUserASpacePermission({ permission: 'UpdateAnyPost', space })
  const [myHiddenPosts, setMyHiddenPosts] = useState<PostWithSomeDetails[]>()

  useSubsocialEffect(
    ({ subsocial }) => {
      let isMounted = true

      if (!isMySpaces && !canHidePost) return setMyHiddenPosts([])

      subsocial
        .findUnlistedPostsWithAllDetails(postIds)
        .then(res => isMounted && setMyHiddenPosts(res))
        .catch(err =>
          log.error('Failed to get unlisted posts with all details by ids:', postIds, err),
        )

      return () => {
        isMounted = false
      }
    },
    [postIds.length, isMySpaces, canHidePost],
  )

  return {
    isLoading: !myHiddenPosts,
    myHiddenPosts: myHiddenPosts || [],
  }
}
