import UserLeaderboardPage from 'src/components/leaderboard/UserLeaderboardPage'
import { return404 } from 'src/components/utils/next'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchUserStatistics } from 'src/rtk/features/leaderboard/userStatistics'

getInitialPropsWithRedux(UserLeaderboardPage, async ({ dispatch, context }) => {
  const { query } = context
  const address = query.address as string
  if (!address || typeof address !== 'string') return return404(context)

  await dispatch(fetchUserStatistics({ address }))
  return { address }
  // await dispatch()
})

export default UserLeaderboardPage
