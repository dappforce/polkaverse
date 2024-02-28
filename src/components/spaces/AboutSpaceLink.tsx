import { SpaceStruct } from 'src/types'
import CustomLink from '../referral/CustomLink'
import { aboutSpaceUrl } from '../urls'

type Props = {
  space: SpaceStruct
  title?: string
  hint?: string
  className?: string
}

export const AboutSpaceLink = ({ space, title, hint, className }: Props) => {
  if (!space.id || !title) return null

  return (
    <CustomLink href='/[spaceId]/about' as={aboutSpaceUrl(space)}>
      <a className={className} title={hint}>
        {title}
      </a>
    </CustomLink>
  )
}

export default AboutSpaceLink
