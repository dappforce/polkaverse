import { AccountId, SpaceStruct } from '@subsocial/api/types'
import { Form, Modal } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { DfForm } from 'src/components/forms'
import TxButton from 'src/components/utils/TxButton'
import messages from 'src/messages'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { InputAccountsField } from '../../roles/AccountInputsField'
import { buildCreateEditorRoleArgs } from '../../roles/editor-role'
import useGetRoleId from '../useRoleCreated'
import { BuiltInRole, useGetSpacePermissionsConfig } from '../utils'
import { EditEditorsTxButton } from './EditEditorsTxButton'
import styles from './Index.module.sass'
import { EditWritePermission } from './UpdateWritePermission'
import { WhoCanPostSelector } from './WhoCanPostSelector'

type Props = {
  space: SpaceStruct
  open: boolean
  closeModal: VoidFunction
}

type FormValues = {
  whoCanPost: BuiltInRole | 'editors'
}

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

const EditSpacePermissionsModal = (props: Props) => {
  const { space, open, closeModal: close } = props
  const spaceId = space.id
  console.log(space)

  const [form] = Form.useForm()
  const initialWhoCanPost = useGetSpacePermissionsConfig(space)
  const { roleId, loaded } = useGetRoleId(spaceId)
  const { spaceEditors: editors = [], loading } = useFetchSpaceEditors(spaceId)

  const [whoCanPost, setWhoCanPost] = useState(initialWhoCanPost)
  const [newEditors, setNewEditors] = useState<AccountId[]>([])

  useEffect(() => {
    setNewEditors(editors)
  }, [loading, whoCanPost, editors.join(','), loaded])

  useEffect(() => {
    if (!initialWhoCanPost) return

    console.log()

    setWhoCanPost(initialWhoCanPost)
  }, [initialWhoCanPost, open])

  return (
    <Modal
      onCancel={close}
      visible={open}
      footer={
        whoCanPost === 'editors' ? (
          <EditEditorsTxButton
            spaceId={spaceId}
            roleId={roleId}
            oldEditors={editors}
            newEditors={newEditors}
            onClose={close}
            loadingEditors={!!loading || !loaded}
            inititalWhoCanPost={initialWhoCanPost}
          />
        ) : (
          <EditWritePermission
            space={space}
            disabled={whoCanPost === initialWhoCanPost}
            whoCanPost={whoCanPost as BuiltInRole}
            onSuccess={close}
            label='Save changes'
          />
        )
      }
      title={'Edit space permissions'}
      className={clsx('DfSignInModal', styles.EditModal)}
    >
      <div className={styles.ModalContent}>
        <DfForm
          layout='vertical'
          form={form}
          initialValues={{ whoCanPost: initialWhoCanPost }}
          className='m-0'
        >
          <Form.Item
            name={fieldName('whoCanPost')}
            help={messages.formHints.whoCanPost[whoCanPost as BuiltInRole | 'editors']}
            className='mb-0'
          >
            <WhoCanPostSelector
              space={space}
              whoCanPost={whoCanPost as BuiltInRole | 'editors'}
              onChange={setWhoCanPost}
            />
          </Form.Item>
          {whoCanPost === 'editors' && (
            <>
              {!roleId ? (
                <TxButton
                  label='Enable support for editors'
                  tx={'roles.createRole'}
                  type='primary'
                  size='large'
                  canUseProxy={false}
                  withSpinner
                  params={buildCreateEditorRoleArgs(spaceId)}
                  successMessage='Great! Editors enabled!'
                />
              ) : (
                <InputAccountsField accounts={newEditors} onChange={setNewEditors} form={form} />
              )}
            </>
          )}
        </DfForm>
      </div>
    </Modal>
  )
}

type EditPermissionsButtonProps = {
  space: SpaceStruct
}

export const EditPermissionsButton = ({ space }: EditPermissionsButtonProps) => {
  const [open, setOpen] = useState(false)

  const openModal = () => setOpen(true)

  const button = (
    <a className='item' onClick={openModal}>
      Manage editors
    </a>
  )

  return (
    <>
      {button}
      {open && (
        <EditSpacePermissionsModal open={open} closeModal={() => setOpen(false)} space={space} />
      )}
    </>
  )
}

export default EditSpacePermissionsModal
