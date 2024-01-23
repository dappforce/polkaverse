import UserLeaderboardPage from 'src/components/leaderboard/UserLeaderboardPage'
import { return404 } from 'src/components/utils/next'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchRewardHistory } from 'src/rtk/features/activeStaking/rewardHistorySlice'
import { fetchLeaderboardData } from 'src/rtk/features/leaderboard/leaderboardSlice'
import { fetchUserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { fetchProfileSpace } from 'src/rtk/features/profiles/profilesSlice'

getInitialPropsWithRedux(UserLeaderboardPage, async ({ dispatch, context, subsocial }) => {
  const { query } = context
  const address = query.address as string
  if (!address || typeof address !== 'string') return return404(context)

  await Promise.all([
    dispatch(fetchUserStatistics({ address })),
    dispatch(fetchRewardHistory({ address })),
    dispatch(fetchProfileSpace({ id: address, api: subsocial })),
    dispatch(fetchLeaderboardData({ role: 'STAKER' })),
    dispatch(fetchLeaderboardData({ role: 'CREATOR' })),
  ])
  return { address }
})

export default UserLeaderboardPage
