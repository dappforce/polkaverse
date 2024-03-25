import { Alert, Button } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import EditSpacePermissionsModal from './editSpacePermissionsModal'
import styles from './SpacePermissionInfoSection.module.sass'
import { permissionsState, useGetSpacePermissionsConfig } from './utils'

type Props = {
  spaceId: string
  className?: string
}

const SpacePermissionInfoSection = ({ spaceId, className }: Props) => {
  const [openModal, setOpenModal] = useState(false)
  const space = useSelectSpace(spaceId)
  const whoCanPostKey = useGetSpacePermissionsConfig(space?.struct)
  const { spaceEditors: editors = [] } = useFetchSpaceEditors(spaceId || '')

  const whoCanPost =
    typeof permissionsState[whoCanPostKey] === 'function'
      ? (permissionsState[whoCanPostKey] as Function)(editors)
      : permissionsState[whoCanPostKey]

  return (
    <>
      <Alert
        className={clsx(styles.InfoSectionWrapper, className)}
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
        space={space?.struct}
        open={openModal}
        closeModal={() => setOpenModal(false)}
      />
    </>
  )
}

export default SpacePermissionInfoSection
