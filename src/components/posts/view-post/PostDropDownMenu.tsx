import { EditOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { FC, useCallback, useState } from 'react'
import CustomLink from 'src/components/referral/CustomLink'
import { useCheckCanEditAndHideSpacePermission } from 'src/components/spaces/roles/utils'
import { editPostUrl } from 'src/components/urls'
import { ViewOnIpfs } from 'src/components/utils'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { DropdownMenu } from 'src/components/utils/DropDownMenu'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useIsAdmin } from 'src/rtk/features/moderation/hooks'
import { PostData, SpaceStruct } from 'src/types'
import { useIsMyAddress, useMyAddress } from '../../auth/MyAccountsContext'
import DeletePostButton from '../DeletePostButton'
import HiddenPostButton from '../HiddenPostButton'
import ModerateButton from '../ModerateButton'
import MovePostLink from '../MovePostLink'

type DropdownProps = {
  space?: SpaceStruct
  post: PostData
  withEditButton?: boolean
  onEditComment?: VoidFunction
  className?: string
  style?: React.CSSProperties
}

const InnerPostDropDownMenu: FC<DropdownProps> = props => {
  const { space, post, onEditComment, ...otherProps } = props
  const myAddress = useMyAddress()
  const { struct } = post
  const postId = struct.id
  const sendEvent = useSendEvent()
  const isAdmin = useIsAdmin()

  const { canEditPost, canHidePost, canMovePost } = useCheckCanEditAndHideSpacePermission(props)

  const editPostProps = {
    href: '/[spaceId]/[slug]/edit',
    as: editPostUrl(space, post),
  }

  const buildMenuItems = useCallback(() => {
    sendEvent('open_post_dropdown_menu')

    return (
      <>
        {canEditPost && (
          <Menu.Item key={`edit-${postId}`}>
            {struct.isComment && onEditComment ? (
              <a className='item' onClick={onEditComment}>
                {'Edit comment'}
              </a>
            ) : (
              <CustomLink {...editPostProps}>
                <a className='item'>{'Edit post'}</a>
              </CustomLink>
            )}
          </Menu.Item>
        )}
        {isAdmin && (
          <Menu.Item key={`moderate-${postId}`}>
            <ModerateButton postId={postId} />
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
        {/* <Menu.Item key={`view-reactions-${postId}`}>
          <ReactionModal postId={idToBn(postId)} />
        </Menu.Item> */}
        {/* {struct.createdAtBlock && <Menu.Item key={`view-on-block-${postId}`}>
          <ViewOnBlockchainLink createdAtBlock={struct.createdAtBlock} />
        </Menu.Item>} */}
        <Menu.Item key={`view-on-ipfs-${postId}`}>
          <ViewOnIpfs contentId={struct.contentId} />
        </Menu.Item>
        {canMovePost && (
          <Menu.Item key={`delete-${postId}`}>
            <DeletePostButton post={struct} asLink />
          </Menu.Item>
        )}
      </>
    )
  }, [myAddress, canEditPost, canHidePost, canMovePost, isAdmin])

  return <DropdownMenu buildMenuItems={buildMenuItems} {...otherProps} />
}

const PostDropDown: FC<DropdownProps> = props => {
  const [stub, setStub] = useState(true)
  // prefetch admin data
  useIsAdmin()

  const closeStub = () => setStub(false)

  return stub ? (
    <EllipsisOutlined onMouseEnter={closeStub} onClick={closeStub} className='IconFontSize mx-2' />
  ) : (
    <InnerPostDropDownMenu {...props} />
  )
}

export const PostDropDownMenu: FC<DropdownProps> = ({ withEditButton, ...props }) => {
  const { space, post, className, style } = props
  const isMy = useIsMyAddress(post.struct.ownerId)

  const editPostProps = {
    href: '/[spaceId]/[slug]/edit',
    as: editPostUrl(space, post),
  }

  return (
    <span className={className} style={style}>
      <PostDropDown {...props} />
      {withEditButton && isMy && (
        <ButtonLink
          {...editPostProps}
          className='bg-transparent ml-1 px-2 py-0'
          style={{ height: '28px' }}
        >
          <EditOutlined /> Edit
        </ButtonLink>
      )}
    </span>
  )
}
