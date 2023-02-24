import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import { SpaceStruct } from 'src/types'
import ViewSpaceLink from '../ViewSpaceLink'

type Props = Omit<BaseAvatarProps, 'identityValue'> & {
  space: SpaceStruct
  asLink?: boolean
  isUnnamedSpace?: boolean
}

export const SpaceAvatar = ({ asLink = true, isUnnamedSpace = false, space, ...props }: Props) =>
  asLink ? (
    <ViewSpaceLink
      space={space}
      title={<BaseAvatar identityValue={isUnnamedSpace ? space.id : space.ownerId} {...props} />}
    />
  ) : (
    <BaseAvatar identityValue={isUnnamedSpace ? space.id : space.ownerId} {...props} />
  )
