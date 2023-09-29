import Link from 'next/link'
import React from 'react'
import { SpaceData } from 'src/types'
import { spaceUrl } from '../urls'
import { useStorybookContext } from '../utils/StorybookContext'

type Props = {
  space?: SpaceData
  subtitle: React.ReactNode
}

export const SpacedSectionTitle = ({ space, subtitle }: Props) => {
  const { isStorybook } = useStorybookContext()
  const name = space?.content?.name

  return (
    <>
      {!isStorybook && space && name && (
        <>
          <Link href='/[spaceId]' as={spaceUrl(space.struct)} legacyBehavior>
            <a>{name}</a>
          </Link>
          <span style={{ margin: '0 .75rem' }}>/</span>
        </>
      )}
      {subtitle}
    </>
  )
}

export default SpacedSectionTitle
