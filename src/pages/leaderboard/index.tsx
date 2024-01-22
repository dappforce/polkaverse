import GeneralLeaderboardPage from 'src/components/leaderboard/GeneralLeaderboardPage'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchGeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'

getInitialPropsWithRedux(GeneralLeaderboardPage, async ({ dispatch }) => {
  await dispatch(fetchGeneralStatistics({ reload: true }))
  return {}
})

export default GeneralLeaderboardPage
