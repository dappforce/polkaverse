import { SpaceStruct } from '@subsocial/api/types'
import { Alert, Button } from 'antd'
import { useState } from 'react'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import EditSpacePermissionsModal from './editSpacePermissionsModal'
import styles from './SpacePermissionInfoSection.module.sass'
import { permissionsState, useGetSpacePermissionsConfig } from './utils'

type Props = {
  space: SpaceStruct
}

const SpacePermissionInfoSection = ({ space }: Props) => {
  const [openModal, setOpenModal] = useState(false)
  const whoCanPostKey = useGetSpacePermissionsConfig(space)
  const { spaceEditors: editors = [] } = useFetchSpaceEditors(space?.id || '')

  const whoCanPost =
    typeof permissionsState[whoCanPostKey] === 'function'
      ? (permissionsState[whoCanPostKey] as Function)(editors)
      : permissionsState[whoCanPostKey]

  return (
    <>
      <Alert
        className={styles.InfoSectionWrapper}
        type='info'
        message={whoCanPost}
        showIcon
        action={
          <Button onClick={() => setOpenModal(true)} type='link'>
            Manage editors
          </Button>
        }
      />

      <EditSpacePermissionsModal
        space={space}
        open={openModal}
        closeModal={() => setOpenModal(false)}
      />
    </>
  )
}

export default SpacePermissionInfoSection
