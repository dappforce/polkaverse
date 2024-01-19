import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchTopUsers, selectTopUsers } from './topUsersSlice'
import { fetchUserStatistics, selectUserStatistics } from './userStatistics'

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
