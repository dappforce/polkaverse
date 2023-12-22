import { PlusCircleOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import { newSpaceUrl } from 'src/components/urls'
import { ButtonLink, IconLink } from 'src/components/utils/CustomLinks'
import { BareProps } from 'src/components/utils/types'

const getNewSpacePath = (asProfile?: boolean) => newSpaceUrl(asProfile)
const getTitle = (asProfile?: boolean) => `Create ${asProfile ? 'profile' : 'space'}`

export type CreateSpaceButtonProps = { asProfile?: boolean }
export const CreateSpaceButton = ({
  children,
  type = 'primary',
  ghost = true,
  asProfile,
  ...otherProps
}: ButtonProps & CreateSpaceButtonProps) => {
  const props = { type, ghost, ...otherProps }

  return (
    <ButtonLink href={getNewSpacePath(asProfile)} {...props}>
      {children || <span>{getTitle(asProfile)}</span>}
    </ButtonLink>
  )
}

const CreateIcon = <PlusCircleOutlined size={48} />

export const CreateSpaceIcon = ({ asProfile, ...props }: BareProps & CreateSpaceButtonProps) => (
  <IconLink
    {...props}
    href={getNewSpacePath(asProfile)}
    title={getTitle(asProfile)}
    icon={CreateIcon}
  />
)
