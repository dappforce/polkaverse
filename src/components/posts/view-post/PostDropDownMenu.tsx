// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { EditOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import Link from 'next/link'
import { FC, useCallback, useState } from 'react'
import { useCheckCanEditAndHideSpacePermission } from 'src/components/spaces/roles/utils'
import { editPostUrl } from 'src/components/urls'
import { ViewOnIpfs } from 'src/components/utils'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { DropdownMenu } from 'src/components/utils/DropDownMenu'
import { useSendGaUserEvent } from 'src/ga'
import { idToBn, PostData, SpaceStruct } from 'src/types'
import { ReactionModal } from '.'
import { useIsMyAddress, useMyAddress } from '../../auth/MyAccountsContext'
import HiddenPostButton from '../HiddenPostButton'
import MovePostLink from '../MovePostLink'

type DropdownProps = {
  space?: SpaceStruct
  post: PostData
  withEditButton?: boolean
  onEditComment?: VoidFunction
}

const InnerPostDropDownMenu: FC<DropdownProps> = props => {
  const { space, post, onEditComment, ...otherProps } = props
  const myAddress = useMyAddress()
  const { struct } = post
  const postId = struct.id
  const sendGaEvent = useSendGaUserEvent()

  const { canEditPost, canHidePost, canMovePost } = useCheckCanEditAndHideSpacePermission(props)

  const editPostProps = {
    href: '/[spaceId]/[slug]/edit',
    as: editPostUrl(space, post),
  }

  const buildMenuItems = useCallback(() => {
    sendGaEvent('Open post dropdown menu')

    return (
      <>
        {canEditPost && (
          <Menu.Item key={`edit-${postId}`}>
            {struct.isComment && onEditComment ? (
              <a className='item' onClick={onEditComment}>
                {'Edit comment'}
              </a>
            ) : (
              <Link {...editPostProps}>
                <a className='item'>{'Edit post'}</a>
              </Link>
            )}
          </Menu.Item>
        )}
        {canHidePost && (
          <Menu.Item key={`hidden-${postId}`}>
            <HiddenPostButton post={struct} asLink />
          </Menu.Item>
        )}
        {canMovePost && (
          <Menu.Item key={`move-${postId}`}>
            <MovePostLink post={post} />
          </Menu.Item>
        )}
        <Menu.Item key={`view-reactions-${postId}`}>
          <ReactionModal postId={idToBn(postId)} />
        </Menu.Item>
        {/* {struct.createdAtBlock && <Menu.Item key={`view-on-block-${postId}`}>
          <ViewOnBlockchainLink createdAtBlock={struct.createdAtBlock} />
        </Menu.Item>} */}
        <Menu.Item key={`view-on-ipfs-${postId}`}>
          <ViewOnIpfs contentId={struct.contentId} />
        </Menu.Item>
      </>
    )
  }, [myAddress, canEditPost, canHidePost, canMovePost])

  return <DropdownMenu buildMenuItems={buildMenuItems} {...otherProps} />
}

const PostDropDown: FC<DropdownProps> = props => {
  const [stub, setStub] = useState(true)

  const closeStub = () => setStub(false)

  return stub ? (
    <EllipsisOutlined onMouseEnter={closeStub} onClick={closeStub} className='IconFontSize mx-2' />
  ) : (
    <InnerPostDropDownMenu {...props} />
  )
}

export const PostDropDownMenu: FC<DropdownProps> = ({ withEditButton, ...props }) => {
  const { space, post } = props
  const isMy = useIsMyAddress(post.struct.ownerId)

  const editPostProps = {
    href: '/[spaceId]/[slug]/edit',
    as: editPostUrl(space, post),
  }

  return (
    <span>
      <PostDropDown {...props} />
      {withEditButton && isMy && (
        <ButtonLink {...editPostProps} className='bg-transparent'>
          <EditOutlined /> Edit
        </ButtonLink>
      )}
    </span>
  )
}
