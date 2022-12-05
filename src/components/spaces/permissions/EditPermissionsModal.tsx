import { Button, Form, Modal } from 'antd'
import { useState } from 'react'
import { DfForm } from 'src/components/forms'
import messages from 'src/messages'
import { SpaceStruct } from 'src/types'
import { EditWritePermission } from './UpdateWritePermission'
import { BuiltInRole, getWhoCanPost } from './utils'
import { WhoCanPostSelector } from './WhoCanPostSelector'

type InnerEditPermissions = {
  space: SpaceStruct
}

type EditPermissionsModalProps = InnerEditPermissions & {
  open: boolean
  close: () => void
}

type FormValues = {
  whoCanPost: BuiltInRole
}

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

const getInitialValues = (space: SpaceStruct) => {
  return { whoCanPost: getWhoCanPost(space) } as FormValues
}

export const EditPermissionsModal = ({ space, open, close }: EditPermissionsModalProps) => {
  const [form] = Form.useForm()

  const initialValues = getInitialValues(space)
  const initialWhoCanPost = initialValues.whoCanPost

  const [whoCanPost, setWhoCanPost] = useState(initialWhoCanPost)

  return (
    <Modal
      onCancel={close}
      visible={open}
      title={'Edit space permissions'}
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <EditWritePermission
            space={space}
            disabled={whoCanPost === initialWhoCanPost}
            whoCanPost={whoCanPost}
            onSuccess={close}
          />
        </>
      }
    >
      <DfForm layout='vertical' form={form} initialValues={initialValues} className='m-0'>
        <Form.Item
          name={fieldName('whoCanPost')}
          label='Who can post to this space?'
          help={messages.formHints.whoCanPost[whoCanPost]}
          className='mb-2'
        >
          <WhoCanPostSelector space={space} onChange={setWhoCanPost} />
        </Form.Item>
      </DfForm>
    </Modal>
  )
}

export const OpenEditPermissions = ({ space }: InnerEditPermissions) => {
  const [open, setOpen] = useState(false)

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <div onClick={openModal}>Edit permissions</div>
      <EditPermissionsModal space={space} open={open} close={closeModal} />
    </>
  )
}
