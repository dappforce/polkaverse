import { IpfsContent } from '@subsocial/api/substrate/wrappers'
import { AccountId, RoleId, SpaceId, SpacePermissionKey } from 'src/types'
import { newUserFromAccountId } from './utils'

export const buildCreateEditorRoleArgs = (spaceId: SpaceId) => {
  const editorIpfsCid = 'bafyreifauyay7gc66gqcw6yavkq3zbltaefragl7phtoz3ohnzf2wpcoby'
  const editorPermissions: SpacePermissionKey[] = ['CreatePosts', 'HideAnyPost', 'HideAnyComment']

  return [spaceId, null, IpfsContent(editorIpfsCid), editorPermissions]
}

type GrantOrRevokeRoleArgsTuple = [number, any[]]

export const buildGrantOrRevokeRoleArgs = (roleId: RoleId, users: AccountId[]) =>
  [roleId, users.map(newUserFromAccountId)] as unknown as GrantOrRevokeRoleArgsTuple
