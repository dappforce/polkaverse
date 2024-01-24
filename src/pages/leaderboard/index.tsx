import GeneralLeaderboardPage from 'src/components/leaderboard/GeneralLeaderboardPage'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchGeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'
import { fetchLeaderboardData } from 'src/rtk/features/leaderboard/leaderboardSlice'

getInitialPropsWithRedux(GeneralLeaderboardPage, async ({ dispatch }) => {
  await Promise.all([
    dispatch(fetchGeneralStatistics({ reload: true })),
    dispatch(fetchLeaderboardData({ role: 'staker' })),
    dispatch(fetchLeaderboardData({ role: 'creator' })),
  ])
  return {}
})

export default GeneralLeaderboardPage
