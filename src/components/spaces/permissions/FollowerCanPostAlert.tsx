// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Alert } from 'antd'
import { useAmISpaceFollower } from 'src/components/utils/FollowSpaceButton'
import { SpaceStruct } from 'src/types'
import { useIsMySpace } from '../helpers'
import { getWhoCanPost } from './utils'

type Props = {
  space: SpaceStruct
}

const getCanFollowersPost = (space: SpaceStruct) => getWhoCanPost(space) === 'follower'

export const FollowerCanPostAlert = ({ space }: Props) => {
  const canFollowersPost = getCanFollowersPost(space)
  const isFollower = useAmISpaceFollower(space.id)
  const isMySpace = useIsMySpace(space)

  if (!canFollowersPost || isFollower || isMySpace) return null

  return (
    <Alert
      className='FollowerCanPostAlert'
      message='Follow this space if you want to post here.'
      type='info'
      showIcon
    />
  )
}
