import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useIsMySpace } from 'src/components/spaces/helpers'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useAmISpaceFollower } from 'src/components/utils/FollowSpaceButton'
import { useAppSelector } from 'src/rtk/app/store'
import { selectMyPermissionsBySpaceId } from 'src/rtk/features/permissions/mySpacePermissionsSlice'
import { SpacePermissionKey, SpacePermissions, SpaceStruct } from 'src/types'

type HookProps = {
  space?: SpaceStruct
  permission: SpacePermissionKey
}

type Props = HookProps & {
  isMySpace: boolean
  isFollower: boolean
  defaultSpacePermissions: SpacePermissions
  rolePermissions?: SpacePermissionKey[]
}

const resolveSpacePermissions = (
  space: SpaceStruct,
  {
    nonePermissions,
    everyonePermissions,
    followerPermissions,
    spaceOwnerPermissions,
  }: SpacePermissions,
): SpacePermissions => ({
  nonePermissions: { ...nonePermissions, ...space.nonePermissions },
  everyonePermissions: { ...everyonePermissions, ...space.everyonePermissions },
  followerPermissions: { ...followerPermissions, ...space.followerPermissions },
  spaceOwnerPermissions: { ...spaceOwnerPermissions, ...space.spaceOwnerPermissions },
})

export const hasUserASpacePermissions = ({
  space,
  permission,
  isFollower,
  isMySpace,
  defaultSpacePermissions,
  rolePermissions,
}: Props): boolean => {
  if (!space) return false

  const { nonePermissions, everyonePermissions, followerPermissions, spaceOwnerPermissions } =
    resolveSpacePermissions(space, defaultSpacePermissions)

  if (nonePermissions?.[permission]) return false

  return (
    everyonePermissions?.[permission] ||
    (isFollower && followerPermissions?.[permission]) ||
    (isMySpace && spaceOwnerPermissions?.[permission]) ||
    rolePermissions?.includes(permission) ||
    false
  )
}

const usePreparePropsForPermissionChecker = (
  space?: SpaceStruct,
): PermissionCheckerProps | undefined => {
  const {
    consts: { defaultSpacePermissions },
    apiState,
  } = useSubsocialApi()
  const isMySpace = useIsMySpace(space)
  const spaceId = space?.id

  const isFollower = useAmISpaceFollower(spaceId)
  const myAddress = useMyAddress()

  const rolePermissions = useAppSelector(state =>
    spaceId && myAddress
      ? selectMyPermissionsBySpaceId(state, { spaceId, myAddress })?.permissions
      : undefined,
  )

  if (apiState !== 'READY' || !defaultSpacePermissions) return undefined

  return {
    defaultSpacePermissions,
    rolePermissions,
    isMySpace,
    isFollower,
  }
}

export const useHasUserASpacePermission = (props: HookProps): boolean => {
  const permCheckerProps = usePreparePropsForPermissionChecker(props.space)

  if (!permCheckerProps) return false

  return hasUserASpacePermissions({ ...props, ...permCheckerProps })
}

type PermissionCheckerProps = Omit<Props, 'permission'>

export type CheckPermissionFn = (permission: SpacePermissionKey) => boolean

export const createCheckSpacePermission =
  (props: PermissionCheckerProps) => (permission: SpacePermissionKey) =>
    hasUserASpacePermissions({ ...props, permission })

export const useCreateCheckSpacePermission = (props: Omit<HookProps, 'permission'>) => {
  const checkProps = usePreparePropsForPermissionChecker(props.space)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (!checkProps) return () => false

  return createCheckSpacePermission({ ...props, ...checkProps })
}
