import { isEmptyStr } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { getSpaceId } from 'src/components/substrate'
import { AnyAccountId, SpaceData } from 'src/types'

export const useLoadUnlistedSpace = (address: AnyAccountId) => {
  const isMySpace = useIsMyAddress(address)
  const {
    query: { spaceId },
  } = useRouter()
  const idOrHandle = spaceId as string

  const [myHiddenSpace, setMyHiddenSpace] = useState<SpaceData>()

  useSubsocialEffect(
    ({ subsocial }) => {
      let isMounted = true

      if (!isMySpace || isEmptyStr(idOrHandle)) return

      const loadSpaceFromId = async () => {
        const id = await getSpaceId(idOrHandle, subsocial)
        const spaceData = id && (await subsocial.findSpace({ id }))
        isMounted && spaceData && setMyHiddenSpace(spaceData)
      }

      loadSpaceFromId()

      return () => {
        isMounted = false
      }
    },
    [isMySpace],
  )

  return {
    isLoading: !myHiddenSpace,
    myHiddenSpace,
  }
}
