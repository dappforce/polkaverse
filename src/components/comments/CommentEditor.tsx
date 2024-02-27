import { Alert, Button, Input } from 'antd'
import BN from 'bn.js'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import { Controller, ErrorMessage, useForm } from 'react-hook-form'
import { TbCoins } from 'react-icons/tb'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { CommentContent, IpfsCid } from 'src/types'
import { activeStakingLinks } from 'src/utils/links'
import { useAmIBlocked, useMyAddress } from '../auth/MyAccountsContext'
import { buildSharePostValidationSchema } from '../posts/PostValidation'
import { getNewIdFromEvent } from '../substrate'
import { tmpClientId } from '../utils'
import { MyAccountProps } from '../utils/MyAccount'
import styles from './CommentEditor.module.sass'
import { CommentTxButtonType } from './utils'

// A height of EasyMDE toolbar with our custom styles. Can be changed
// const toolbarHeight = 49

// function scrollToolbarHeight() {
//   if (window) {
//     window.scrollBy(0, toolbarHeight)
//   }
// }

export type CommentEventProps = {
  eventSource: string
  level: number
  isPostAuthor: boolean
  isEditing?: boolean
}
type Props = MyAccountProps & {
  content?: CommentContent
  withCancel?: boolean
  onCancel?: () => void
  onSuccess?: (id?: BN) => void
  CommentTxButton: (props: CommentTxButtonType) => JSX.Element
  asStub?: boolean
  className?: string
  autoFocus?: boolean
  eventProps: CommentEventProps
}

const Fields = {
  body: 'body',
}

export const CommentEditor = (props: Props) => {
  const {
    content,
    withCancel,
    onCancel: onCancelCallback,
    onSuccess,
    CommentTxButton,
    asStub,
    autoFocus,
    eventProps,
  } = props
  const { ipfs } = useSubsocialApi()
  const [ipfsCid, setIpfsCid] = useState<IpfsCid>()
  const [fakeId] = useState(tmpClientId())
  const [toolbar, setToolbar] = useState(!asStub)

  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const sendEvent = useSendEvent()

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
    onCancelCallback?.()
    resetForm()
  }

  const onTxFailed: TxFailedCallback = () => {
    ipfsCid && ipfs.removeContent(ipfsCid).catch(err => new Error(err))
    setIsLoading(false)
  }

  const onTxSuccess: TxCallback = txResult => {
    const id = getNewIdFromEvent(txResult)
    onSuccess && onSuccess(id)
    resetForm()
    setIsLoading(false)
  }

  const renderTxButton = () => (
    <CommentTxButton
      loading={isLoading}
      ipfs={ipfs}
      setIpfsCid={setIpfsCid}
      json={{ body: body.replace(/\n/g, '\n\n') } as CommentContent}
      fakeId={fakeId}
      disabled={isSubmitting || !dirty}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      onClick={() => {
        setIsLoading(true)
        sendEvent('comment', eventProps)
      }}
    />
  )

  const showToolbar = () => {
    if (!toolbar) {
      setToolbar(true)
      // scrollToolbarHeight()
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
              size='large'
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
      {totalStake?.hasStakedEnough === false && toolbar && (
        <Alert
          message={
            <div className='d-flex align-items-center GapTiny' style={{ color: '#bd7d05' }}>
              <TbCoins className='FontNormal' style={{ flexShrink: '0' }} />
              <span>
                <span>This comment could earn SUB rewards.</span>
                <Link passHref href={activeStakingLinks.learnMore}>
                  <a className='FontWeightMedium ml-1'>Learn How</a>
                </Link>
              </span>
            </div>
          }
          type='warning'
          className='RoundedLarge mt-2.5'
          style={{ border: 'none' }}
        />
      )}
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
