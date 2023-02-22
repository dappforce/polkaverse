import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import { SpaceStruct } from 'src/types'
import ViewSpaceLink from '../ViewSpaceLink'

type Props = Omit<BaseAvatarProps, 'identityValue'> & {
  space: SpaceStruct
  asLink?: boolean
}

export const SpaceAvatar = ({ asLink = true, space, ...props }: Props) =>
  asLink ? (
    <ViewSpaceLink space={space} title={<BaseAvatar identityValue={space.id} {...props} />} />
  ) : (
    <BaseAvatar identityValue={space.id} {...props} />
  )
