import { useMemo } from 'react'
import { useFetchProfileSpace } from 'src/rtk/app/hooks'
import { getProfileUrl } from 'src/utils/account'

const useGetProfileUrl = (address: string) => {
  const { entity: profile } = useFetchProfileSpace({ id: address })

  const spaceId = profile?.id

  return useMemo(() => {
    return getProfileUrl(address, spaceId)
  }, [spaceId, address])
}

export default useGetProfileUrl
