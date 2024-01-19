import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchTopUsers, selectTopUsers } from './topUsersSlice'

export function useFetchTopUsers() {
  const data = useAppSelector(state => selectTopUsers(state))
  const fetchData = useFetchWithoutApi(fetchTopUsers, {})

  return {
    ...fetchData,
    data,
  }
}
