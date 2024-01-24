import { LeaderboardRole } from 'src/components/utils/datahub/leaderboard'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchGeneralStatistics, selectGeneralStatistics } from './generalStatisticsSlice'
import { selectLeaderboard } from './leaderboardSlice'
import { fetchTopUsers, selectTopUsers } from './topUsersSlice'
import { fetchUserStatistics, selectUserStatistics } from './userStatisticsSlice'

export function useFetchTopUsers() {
  const data = useAppSelector(state => selectTopUsers(state))
  const fetchData = useFetchWithoutApi(fetchTopUsers, {})

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
