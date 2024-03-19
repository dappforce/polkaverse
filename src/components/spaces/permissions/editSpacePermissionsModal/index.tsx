import { AccountId, SpaceStruct } from '@subsocial/api/types'
import { Form, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { DfForm } from 'src/components/forms'
import TxButton from 'src/components/utils/TxButton'
import messages from 'src/messages'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { InputAccountsField } from '../../roles/AccountInputsField'
import { buildCreateEditorRoleArgs } from '../../roles/editor-role'
import useGetRoleId from '../useRoleCreated'
import { BuiltInRole, useGetSpacePermissionsConfig } from '../utils'
import { EditEditorsTxButton } from './SaveChangesTxButton'
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
  const [form] = Form.useForm()

  const initialWhoCanPost = useGetSpacePermissionsConfig(space)
  const { roleId, loaded } = useGetRoleId(spaceId)
  const { spaceEditors: editors = [], loading } = useFetchSpaceEditors(spaceId)

  const [whoCanPost, setWhoCanPost] = useState(initialWhoCanPost)
  const [newEditors, setNewEditors] = useState<AccountId[]>([])

  useEffect(() => {
    setNewEditors(editors)
  }, [loading, whoCanPost])

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
    >
      <div>
        <DfForm
          layout='vertical'
          form={form}
          initialValues={{ whoCanPost: initialWhoCanPost }}
          className='m-0'
        >
          <Form.Item
            name={fieldName('whoCanPost')}
            help={messages.formHints.whoCanPost[whoCanPost as BuiltInRole | 'editors']}
            className='mb-2'
          >
            <WhoCanPostSelector space={space} onChange={setWhoCanPost} />
          </Form.Item>
          {whoCanPost === 'editors' && (
            <>
              {!roleId ? (
                <TxButton
                  label='Enable support for editors'
                  tx={'roles.createRole'}
                  type='primary'
                  canUseProxy={false}
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

export default EditSpacePermissionsModal
