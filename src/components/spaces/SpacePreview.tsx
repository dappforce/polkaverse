import React from 'react'
import { SpaceId, SpaceWithSomeDetails } from 'src/types'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import CustomLink from '../referral/CustomLink'
import { createNewPostLinkProps } from './helpers'
import { ViewSpace } from './ViewSpace'

type PreviewProps = {
  space: SpaceWithSomeDetails
}

export const SpacePreview = ({ space }: PreviewProps) => (
  <ViewSpace spaceData={space} withFollowButton preview />
)

type PublicSpacePreviewByIdProps = {
  spaceId: SpaceId
}

export const PublicSpacePreviewById = React.memo(({ spaceId }: PublicSpacePreviewByIdProps) => {
  const space = useSelectSpace(spaceId)

  if (!space) return null

  return <SpacePreview space={space} />
})

type LinkSpacePreviewByIdProps = PublicSpacePreviewByIdProps & {
  closeModal: VoidFunction
}

export const LinkSpacePreviewById = React.memo(
  ({ spaceId, closeModal }: LinkSpacePreviewByIdProps) => {
    const space = useSelectSpace(spaceId)

    if (!space) return null

    return (
      <CustomLink {...createNewPostLinkProps(space.struct)}>
        <ViewSpace onClick={closeModal} spaceData={space} miniPreview withFollowButton={false} />
      </CustomLink>
    )
  },
)
