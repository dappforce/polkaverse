import { IpfsContent, PostExtension } from '@subsocial/api/substrate/wrappers'
import { isEmptyArray } from '@subsocial/utils'
import { Modal } from 'antd'
import Button from 'antd/lib/button'
import { LabeledValue } from 'antd/lib/select'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Controller, ErrorMessage, useForm } from 'react-hook-form'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { useCreateReloadPost, useCreateReloadSpace } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsByOwner } from 'src/rtk/features/spaceIds/ownSpaceIdsSlice'
import { IpfsCid, PostId, SharedPostContent, SpaceId } from 'src/types'
import { CreateSpaceButton } from '../../../spaces/helpers'
import { getTxParams } from '../../../substrate'
import { useSubsocialApi } from '../../../substrate/SubstrateContext'
import DfMdEditor from '../../../utils/DfMdEditor'
import { MyAccountProps } from '../../../utils/MyAccount'
import SelectSpacePreview from '../../../utils/SelectSpacePreview'
import { buildSharePostValidationSchema } from '../../PostValidation'
import { PublicPostPreviewById } from '../../PublicPostPreview'
import styles from './index.module.sass'

const TxButton = dynamic(() => import('../../../utils/TxButton'), { ssr: false })

type Props = MyAccountProps & {
  postId: PostId
  spaceIds?: SpaceId[]
  open?: boolean
  onClose: () => void
}

const Fields = {
  body: 'body',
}

const InnerSharePostModal = (props: Props) => {
  const { open, onClose, postId, spaceIds } = props

  const extension = PostExtension({ SharedPost: postId })

  const { ipfs } = useSubsocialApi()
  const [IpfsCid, setIpfsCid] = useState<IpfsCid>()
  const [spaceId, setSpaceId] = useState(spaceIds![0])
  const reloadPost = useCreateReloadPost()
  const reloadSpace = useCreateReloadSpace()
  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur',
  })

  const body = watch(Fields.body, '')
  const { isSubmitting } = formState

  useEffect(() => {
    if (!spaceIds) return
    setSpaceId(spaceIds[0])
  }, [spaceIds])

  const onTxFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.unpinContentFromIpfs(IpfsCid).catch(err => new Error(err))
    onClose()
  }

  const onTxSuccess: TxCallback = () => {
    reloadPost({ id: postId })
    reloadSpace({ id: spaceId })
    onClose()
  }

  const newTxParams = (hash: IpfsCid) => {
    return [spaceId, extension, IpfsContent(hash)]
  }

  const renderTxButton = () => (
    <TxButton
      type='primary'
      label={'Create a post'}
      disabled={isSubmitting}
      params={() =>
        getTxParams({
          json: { body } as SharedPostContent,
          buildTxParamsCallback: newTxParams,
          setIpfsCid,
          ipfs,
        })
      }
      tx={'posts.createPost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Shared to your space'
      failedMessage='Failed to share'
    />
  )

  const renderShareView = () => {
    if (isEmptyArray(spaceIds)) {
      return (
        <CreateSpaceButton>
          <a className='ui button primary'>Create my first space</a>
        </CreateSpaceButton>
      )
    }

    return (
      <div className={styles.DfShareModalBody}>
        <span className={styles.DfShareModalSelector}>
          <SelectSpacePreview
            style={{ width: 250 }}
            spaceIds={spaceIds || []}
            onSelect={saveSpace}
            imageSize={24}
            defaultValue={spaceId?.toString()}
          />
        </span>

        <form style={{ margin: '1rem 0' }}>
          <Controller
            control={control}
            as={<DfMdEditor options={{ autofocus: true }} />}
            name={Fields.body}
            value={body}
            className={`${errors[Fields.body] && 'error'} ${styles.DfShareModalMdEditor}`}
          />
          <div className='DfError'>
            <ErrorMessage errors={errors} name={Fields.body} />
          </div>
        </form>
        <PublicPostPreviewById postId={postId} /* asRegularPost */ />
      </div>
    )
  }

  const saveSpace = (value?: string | number | LabeledValue) => {
    setSpaceId((value as LabeledValue).value.toString())
  }

  return (
    <Modal
      onCancel={onClose}
      visible={open}
      title={'Share post'}
      className={styles.DfShareModal}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          {renderTxButton()}
        </>
      }
    >
      {renderShareView()}
    </Modal>
  )
}

export const SharePostModal = (props: Props) => {
  const myAddress = useMyAddress()
  const mySpaceIds =
    useAppSelector(state => selectSpaceIdsByOwner(state, myAddress as string)) || []

  if (!mySpaceIds) {
    return null
  }

  return <InnerSharePostModal {...props} spaceIds={mySpaceIds} />
}
