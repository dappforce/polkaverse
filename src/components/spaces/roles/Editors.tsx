import { Button, Form, Modal } from 'antd'
import BN from 'bn.js'
import { useEffect, useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { DfForm } from 'src/components/forms'
import { useSubsocialApi } from 'src/components/substrate'
import { Loading } from 'src/components/utils'
import TxButton from 'src/components/utils/TxButton'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { upsertSpaceEditorsBySpaceId } from 'src/rtk/features/accounts/spaceEditorsSlice'
import { AccountId, bnToId, RoleId, SpaceId, SpaceStruct } from 'src/types'
import { eqSet } from 'src/utils/set'
import { InputAccountsField } from './AccountInputsField'
import { buildGrantOrRevokeRoleArgs } from './editor-role'
import { EnableEditorsButton } from './EnableEditorsButton'

type AddEditorProps = {
  spaceId: SpaceId
  roleId: RoleId
}

type ModalProps = AddEditorProps & {
  open: boolean
  onClose: () => void
}

export const AddEditorsModal = (props: ModalProps) => {
  const { spaceId, roleId, open, onClose } = props
  const { api, apiState } = useSubsocialApi()
  const [form] = Form.useForm()
  const { spaceEditors: oldEditors = [], loading } = useFetchSpaceEditors(spaceId)
  const [newEditors, setNewEditors] = useState<AccountId[]>([])
  const noChangedEditors = eqSet(oldEditors, newEditors)

  const dispatch = useAppDispatch()

  useEffect(() => {
    !newEditors.length && setNewEditors(oldEditors)
  }, [loading])

  if (apiState !== 'READY' || !api || loading) return <Loading label='Loading editors' />

  const getTxParams = async () => {
    const editorsForDelete = oldEditors.filter(editor => !newEditors.includes(editor))

    const batchTxs = []

    if (newEditors.length) {
      batchTxs.push(api.tx.roles.grantRole(...buildGrantOrRevokeRoleArgs(roleId, newEditors)))
    }

    if (editorsForDelete.length) {
      batchTxs.push(
        api.tx.roles.revokeRole(...buildGrantOrRevokeRoleArgs(roleId, editorsForDelete)),
      )
    }

    return [batchTxs]
  }

  const onSuccess = () => {
    dispatch(
      upsertSpaceEditorsBySpaceId({
        id: spaceId,
        spaceEditors: newEditors,
      }),
    )
    onClose()
  }

  const renderTxButton = () => (
    <TxButton
      type='primary'
      label={'Update editors'}
      params={getTxParams}
      disabled={noChangedEditors}
      canUseProxy={false}
      tx={'utility.batch'}
      onSuccess={onSuccess}
      successMessage='Editors updated'
      failedMessage='Failed to update editors'
    />
  )

  return (
    <Modal
      onCancel={onClose}
      visible={open}
      title={'Edit editors'}
      width={600}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          {renderTxButton()}
        </>
      }
    >
      <DfForm
        form={form}
        validateTrigger={['onChange', 'onBlur']}
        className='my-0'
        layout='vertical'
      >
        <InputAccountsField accounts={newEditors} onChange={setNewEditors} form={form} />
      </DfForm>
      {/* <p>Current owner: {currentOwner.toString()}</p>
    {newOwner && <p>New owner: {newOwner.toString()}</p>} */}
    </Modal>
  )
}

type EditEditorsButtonProps = {
  space: SpaceStruct
  roleId?: RoleId
}

const InnerEditorsButton = ({ space, roleId }: EditEditorsButtonProps) => {
  const [open, setOpen] = useState(false)

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const button = roleId ? (
    <a className='item' onClick={openModal}>
      Edit editors
    </a>
  ) : (
    <EnableEditorsButton spaceId={space.id} openModal={openModal} />
  )

  return (
    <>
      {button}
      {open && roleId && (
        <AddEditorsModal open={open} onClose={closeModal} roleId={roleId} spaceId={space.id} />
      )}
    </>
  )
}

export const EditorsLink = ({ space }: EditEditorsButtonProps) => {
  const spaceId = space?.id
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

  if (!space || !loaded) return null

  return <InnerEditorsButton roleId={roleId} space={space} />
}

export default EditorsLink
