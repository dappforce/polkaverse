import Link from 'next/link'
import { SpaceStruct } from 'src/types'
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
    <Link href='/[spaceId]/about' as={aboutSpaceUrl(space)} legacyBehavior>
      <a className={className} title={hint}>
        {title}
      </a>
    </Link>
  )
}

export default AboutSpaceLink
