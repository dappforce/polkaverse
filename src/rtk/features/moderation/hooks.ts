import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { appId } from 'src/config/env'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchModerator, selectModerator } from './moderatorSlice'

export function useFetchModerator(address: string) {
  const data = useAppSelector(state => selectModerator(state, address))
  const fetchData = useFetchWithoutApi(fetchModerator, { address: address }, { enabled: !!address })

  return {
    ...fetchData,
    data,
  }
}

export function useIsAdmin() {
  const myAddress = useMyAddress()
  const { data: moderator } = useFetchModerator(myAddress)
  return moderator?.appIds.includes(appId)
}
