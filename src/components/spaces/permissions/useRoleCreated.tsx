import { RoleId } from '@subsocial/api/types'
import { bnToId } from '@subsocial/utils'
import BN from 'bn.js'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'

const useGetRoleId = (spaceId: string) => {
  const [roleId, setRoleId] = useState<RoleId>()
  const [loaded, setLoaded] = useState(false)

  useSubsocialEffect(
    ({ substrate }) => {
      if (!spaceId) return

      let unsub: any

      const loadRoleAndEditors = async () => {
        const api = await (await substrate.api).isReady

        unsub = await api.query.roles.roleIdsBySpaceId(spaceId, (data: any) => {
          const editorRoleIdBn = (data as unknown as BN[])[0]
          editorRoleIdBn && setRoleId(bnToId(editorRoleIdBn))
          setLoaded(true)
        })
      }

      loadRoleAndEditors().catch(err => console.error(err))

      return () => unsub && unsub()
    },
    [spaceId],
  )

  return { roleId, loaded }
}

export default useGetRoleId
