import styles from './CommentEditor.module.sass'

import { Button, Input } from 'antd'
import BN from 'bn.js'
import clsx from 'clsx'
import { useState } from 'react'
import { Controller, ErrorMessage, useForm } from 'react-hook-form'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { CommentContent, IpfsCid } from 'src/types'
import { useAmIBlocked } from '../auth/MyAccountsContext'
import { buildSharePostValidationSchema } from '../posts/PostValidation'
import { getNewIdFromEvent } from '../substrate'
import { tmpClientId } from '../utils'
import { MyAccountProps } from '../utils/MyAccount'
import { CommentTxButtonType } from './utils'

// A height of EasyMDE toolbar with our custom styles. Can be changed
const toolbarHeight = 49

function scrollToolbarHeight() {
  if (window) {
    window.scrollBy(0, toolbarHeight)
  }
}

type Props = MyAccountProps & {
  content?: CommentContent
  withCancel?: boolean
  callback?: (id?: BN) => void
  CommentTxButton: (props: CommentTxButtonType) => JSX.Element
  asStub?: boolean
  className?: string
  autoFocus?: boolean
}

const Fields = {
  body: 'body',
}

export const CommentEditor = (props: Props) => {
  const { content, withCancel, callback, CommentTxButton, asStub, autoFocus } = props
  const { ipfs } = useSubsocialApi()
  const [ipfsCid, setIpfsCid] = useState<IpfsCid>()
  const [fakeId] = useState(tmpClientId())
  const [toolbar, setToolbar] = useState(!asStub)

  const [isLoading, setIsLoading] = useState(false)

  const { control, errors, formState, watch, reset } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur',
  })

  const blocked = useAmIBlocked()

  if (blocked) return null

  const body = watch(Fields.body, content?.body || '')

  const { isSubmitting, dirty } = formState

  const resetForm = () => {
    reset({ [Fields.body]: '' })
  }

  const onCancel = () => {
    callback && callback()
    resetForm()
  }

  const onTxFailed: TxFailedCallback = () => {
    ipfsCid && ipfs.removeContent(ipfsCid).catch(err => new Error(err))
    callback && callback()
    setIsLoading(false)
  }

  const onTxSuccess: TxCallback = txResult => {
    const id = getNewIdFromEvent(txResult)
    callback && callback(id)
    resetForm()
    setIsLoading(false)
  }

  const renderTxButton = () => (
    <CommentTxButton
      loading={isLoading}
      ipfs={ipfs}
      setIpfsCid={setIpfsCid}
      json={{ body } as CommentContent}
      fakeId={fakeId}
      disabled={isSubmitting || !dirty}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      onClick={() => setIsLoading(true)}
    />
  )

  const showToolbar = () => {
    if (!toolbar) {
      setToolbar(true)
      scrollToolbarHeight()
    }
  }

  return (
    <div className={clsx('DfShareModalBody', props.className)}>
      <form onClick={showToolbar}>
        <Controller
          control={control}
          as={
            <Input.TextArea
              disabled={isLoading}
              placeholder='Write a comment...'
              autoSize={{ minRows: 1, maxRows: 5 }}
              autoFocus={autoFocus}
            />
          }
          name={Fields.body}
          value={body}
          defaultValue={body}
          className={`${styles.DfCommentEditor} ${errors[Fields.body] && 'error'}`}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <div className='DfActionButtonsBlock'>
        {toolbar && renderTxButton()}
        {withCancel && !isLoading && (
          <Button type='link' onClick={onCancel} className='DfGreyLink'>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default CommentEditor
