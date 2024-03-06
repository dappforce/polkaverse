import React from 'react'
import { SpaceData } from 'src/types'
import CustomLink from '../referral/CustomLink'
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
          <CustomLink href='/[spaceId]' as={spaceUrl(space.struct)}>
            <a>{name}</a>
          </CustomLink>
          <span style={{ margin: '0 .75rem' }}>/</span>
        </>
      )}
      {subtitle}
    </>
  )
}

export default SpacedSectionTitle
