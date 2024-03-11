import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/api/utils/registry'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { useCreateCheckSpacePermission } from 'src/permissions/checkPermission'
import { AccountId, PostData, SpacePermissionKey, SpaceStruct } from 'src/types'

type Props = {
  space?: SpaceStruct
  post: PostData
}

export const useCheckCanEditAndHideSpacePermission = ({ post: { struct }, space }: Props) => {
  const { ownerId, isComment } = struct
  const isMyPost = useIsMyAddress(ownerId)

  const checkSpacePermission = useCreateCheckSpacePermission({ space })

  const { hideOwn, updateOwn }: Record<string, SpacePermissionKey> = isComment
    ? {
        // hideAny: 'HideAnyComment',
        hideOwn: 'HideOwnComments',
        updateOwn: 'HideOwnComments',
      }
    : {
        // hideAny: 'HideAnyPost',
        hideOwn: 'HideOwnPosts',
        updateOwn: 'HideOwnPosts',
      }

  const canHidePost =
    (isMyPost && checkSpacePermission(hideOwn)) ||
    (!isComment && checkSpacePermission('HideAnyPost'))

  const canEditPost =
    (isMyPost && checkSpacePermission(updateOwn)) ||
    (!isComment && checkSpacePermission('UpdateAnyPost'))

  const canMovePost = isMyPost && !isComment

  return {
    canHidePost,
    canEditPost,
    canMovePost,
  }
}

export const newUserFromAccountId = (account: AccountId) => ({
  Account: new GenericAccountId(registry, account),
})
