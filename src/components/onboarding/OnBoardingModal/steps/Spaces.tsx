import { useMemo } from 'react'
import SpacesSuggestedForOnBoarding from 'src/components/spaces/SpacesSuggestedForOnBoarding'
import config from 'src/config'
import {
  useOnBoardingData,
  useSaveOnBoardingData,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../types'

const { recommendedSpaceIds } = config

export default function Spaces(props: OnBoardingContentProps) {
  const spaces = useOnBoardingData('spaces')
  const saveSpaces = useSaveOnBoardingData('spaces')

  const spacesSet = useMemo(() => {
    if (!spaces) return new Set<string>()
    return new Set(spaces)
  }, [spaces])

  return (
    <OnBoardingContentContainer {...props} disableSubmitBtn={!spaces || spaces.length === 0}>
      <div>
        <SpacesSuggestedForOnBoarding
          shouldDisplayFollowedSpaces={false}
          spaceIds={recommendedSpaceIds}
          isSmallPreview
          customFollowButton={{
            onClick: (space, type) => {
              const currentSpaces = new Set(spacesSet)
              if (type === 'follow') {
                currentSpaces.add(space.id)
              } else {
                currentSpaces.delete(space.id)
              }
              saveSpaces(Array.from(currentSpaces))
            },
            isFollowed: spaceId => spacesSet.has(spaceId),
          }}
          maxItems={12}
        />
      </div>
    </OnBoardingContentContainer>
  )
}
