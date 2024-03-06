import shuffle from 'lodash.shuffle'
import config from 'src/config'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { SpaceId } from 'src/types'
import { useFetchSpaces } from '../../rtk/features/spaces/spacesHooks'
import { LoadingSpaces } from '../utils'
import { LineSpacePreview, LineSpacePreviewProps } from './LineSpacePreview'
import { PublicSpacePreviewById } from './SpacePreview'
import styles from './spaces.module.sass'

type Props = {
  spaceIds: SpaceId[]
  isSmallPreview?: boolean
  maxItems?: number
  customFollowButton?: LineSpacePreviewProps['customFollowButton']
  shouldDisplayFollowedSpaces?: boolean
}

export const SpacesSuggestedForOnBoarding = ({
  shouldDisplayFollowedSpaces = true,
  customFollowButton,
  spaceIds,
  isSmallPreview = false,
  maxItems = 6,
}: Props) => {
  const usedSpaceIds = shuffle(spaceIds).slice(0, maxItems)
  const { loading } = useFetchSpaces({ ids: usedSpaceIds })

  if (loading) return <LoadingSpaces />

  return (
    <>
      {usedSpaceIds.map(spaceId => {
        return (
          <div key={spaceId} className={styles.DfSpacePreview}>
            {isSmallPreview ? (
              <LineSpacePreview
                shouldDisplayFollowedSpaces={shouldDisplayFollowedSpaces}
                customFollowButton={customFollowButton}
                spaceId={spaceId}
              />
            ) : (
              <PublicSpacePreviewById spaceId={spaceId} />
            )}
          </div>
        )
      })}
    </>
  )
}

getInitialPropsWithRedux(SpacesSuggestedForOnBoarding, async ({ subsocial, dispatch }) => {
  const spaceIds = config.recommendedSpaceIds.slice(0, 5)

  // TODO fetch only public spaces!
  await dispatch(
    fetchSpaces({ api: subsocial, ids: spaceIds, reload: true, eagerLoadHandles: true }),
  )

  return { spaceIds }
})

export default SpacesSuggestedForOnBoarding
