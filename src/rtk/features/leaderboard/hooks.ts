import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { LeaderboardRole } from 'src/components/utils/datahub/leaderboard'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchGeneralStatistics, selectGeneralStatistics } from './generalStatisticsSlice'
import { selectLeaderboard } from './leaderboardSlice'
import { fetchMiniLeaderboard, selectMiniLeaderboard } from './miniLeaderboardSlice'
import { fetchUserStatistics, selectUserStatistics } from './userStatisticsSlice'

export function useFetchMiniLeaderboard() {
  const address = useMyAddress() ?? ''
  const data = useAppSelector(state => selectMiniLeaderboard(state, address))
  const fetchData = useFetchWithoutApi(fetchMiniLeaderboard, { address })

  return {
    ...fetchData,
    data,
  }
}

export function useFetchUserStatistics(address: string) {
  const data = useAppSelector(state => selectUserStatistics(state, address))
  const fetchData = useFetchWithoutApi(
    fetchUserStatistics,
    { address: address },
    { enabled: !!address },
  )

  return {
    ...fetchData,
    data,
  }
}

export function useFetchGeneralStatistics() {
  const data = useAppSelector(state => selectGeneralStatistics(state))
  const fetchData = useFetchWithoutApi(fetchGeneralStatistics, {})

  return {
    ...fetchData,
    data,
  }
}

export function useGetLeaderboardData(role: LeaderboardRole) {
  const data = useAppSelector(state => selectLeaderboard(state)[role])
  return data
}
