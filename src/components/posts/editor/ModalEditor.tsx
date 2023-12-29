import { LoadingOutlined } from '@ant-design/icons'
import { IpfsContent } from '@subsocial/api/substrate/wrappers'
import { newLogger } from '@subsocial/utils'
import { Col, Form, Modal, ModalProps, Row } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { BiImage } from 'react-icons/bi'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { htmlToMd } from 'src/components/editor/tiptap'
import { getNewIdFromEvent, getTxParams } from 'src/components/substrate'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { PreviewUploadedImage, UploadImg } from 'src/components/uploader'
import { postUrl } from 'src/components/urls'
import { SubIcon } from 'src/components/utils'
import { getNonEmptyPostContent } from 'src/components/utils/content'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview'
import TxButton from 'src/components/utils/TxButton'
import { useFetchSpaces, useSelectSpaceIdsWhereAccountCanPost } from 'src/rtk/app/hooks'
import { AnyId, DataSourceTypes, IpfsCid, PostContent } from 'src/types'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { RegularPostExt } from '.'
import { fieldName, FormValues } from './Fileds'
import styles from './index.module.sass'
import { useAutoSaveFromForm } from './utils'

const HtmlEditor = dynamic(() => import('./HtmlEditor'), {
  ssr: false,
})

const log = newLogger('ModalEditor')

export const PostEditorModalBody = ({ closeModal }: { closeModal: () => void }) => {
  const myAddress = useMyAddress()
  const allowedSpaceIds = useSelectSpaceIdsWhereAccountCanPost(myAddress as string)
  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: allowedSpaceIds })
  const [imgUrl, setUrl] = useState<string>()
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [IpfsCid, setIpfsCid] = useState<IpfsCid>()
  const [publishIsDisable, setPublishIsDisable] = useState(true)
  const defaultSpace = allowedSpaceIds[0]
  const router = useRouter()
  const [spaceId, setSpaceId] = useState<string>(defaultSpace)

  const { loading } = useFetchSpaces({ ids: spaceIds, dataSource: DataSourceTypes.SQUID })
  const { saveContent } = useAutoSaveFromForm({ entity: 'post' })

  useEffect(() => {
    setSpaceId(defaultSpace)
  }, [defaultSpace])

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    return [spaceId, RegularPostExt, IpfsContent(cid)]
  }

  const fieldValuesToContent = (): PostContent => {
    const content = getFieldValues()
    content.body = htmlToMd(content.body)
    return getNonEmptyPostContent({ ...content } as PostContent)
  }

  const pinToIpfsAndBuildTxParams = () => {
    return getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs,
    })
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = txResult => {
    const id = getNewIdFromEvent(txResult)?.toString()
    if (id) {
      goToPostPage(id)
      closeModal()
    }
  }

  const goToPostPage = (postId: AnyId) => {
    const content = getFieldValues() as PostContent
    const postData = { struct: { id: postId.toString() }, content }
    router
      .push('/[spaceId]/[slug]', postUrl({ id: spaceId! }, postData))
      .catch(err => log.error(`Failed to redirect to a post page. ${err}`))
  }

  const txProps = {
    label: 'Publish',
    tx: 'posts.createPost',
    params: pinToIpfsAndBuildTxParams,
    onSuccess,
    onFailed,
  }

  const saveDraft = (body?: string) => {
    const content = form.getFieldsValue() as PostContent
    if (body) {
      content.body = body
    }
    content.body = htmlToMd(content.body) ?? ''
    setPublishIsDisable(!content.body)
    saveContent(content)
  }

  const onCoverChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
    setUrl(url)
  }

  const SpaceSelector = useCallback(
    () => (
      <SelectSpacePreview
        loading={loading}
        className={styles.SpaceSelector}
        spaceIds={allowedSpaceIds}
        defaultValue={defaultSpace}
        imageSize={32}
        onSelect={value => {
          setSpaceId((value as LabeledValue).value.toString())
        }}
      />
    ),
    [defaultSpace, loading],
  )

  return (
    <Form form={form} className='my-0' onFieldsChange={() => saveDraft()}>
      <SpaceSelector />
      <Form.Item name={fieldName('body')} className='my-3'>
        {/* value and onChange are provided by Form.Item */}
        <HtmlEditor saveBodyDraft={saveDraft} className={clsx(styles.FastEditor, 'ant-input')} />
      </Form.Item>
      {imgUrl && (
        <PreviewUploadedImage
          className={styles.DfImagePreview}
          imgUrl={imgUrl}
          onRemove={() => {
            onCoverChanged(undefined)
          }}
        />
      )}
      <Row justify='space-between' align='middle' className='mt-3'>
        <Col>
          <Form.Item name={fieldName('image')} className={clsx('my-0', styles.UploadImageModalBtn)}>
            <UploadImg
              onChange={onCoverChanged}
              UploadButton={({ loading }) =>
                loading ? <LoadingOutlined size={24} /> : <SubIcon Icon={BiImage} size={24} />
              }
            />
          </Form.Item>
        </Col>
        <Col>
          <ButtonLink
            href='/[spaceId]/posts/new'
            as={`/${spaceId}/posts/new`}
            className={clsx('LightPinkButton', 'mr-2')}
          >
            Full Editor
          </ButtonLink>
          <TxButton type='primary' disabled={publishIsDisable} {...txProps} />
        </Col>
      </Row>
    </Form>
  )
}

export interface PostEditorModalProps extends Omit<ModalProps, 'onCancel'> {
  onCancel?: () => void
}
export const PostEditorModal = (props: PostEditorModalProps) => {
  // const myAddress = useMyAddress()
  // const { data } = useFetchTotalStake(myAddress ?? '')
  // const hasStaked = data?.hasStaked

  return (
    <Modal
      className={styles.ModalEditor}
      closable={false}
      footer={null}
      bodyStyle={{ padding: 0, background: 'transparent', overflow: 'visible' }}
      {...props}
    >
      <div className={styles.Content}>
        <PostEditorModalBody closeModal={() => props.onCancel && props.onCancel()} />
      </div>
      {/* <div className={styles.InfoPanel}>
        <div className={styles.InfoPanelContent}>
          <div className={styles.Title}>
            <AiFillInfoCircle />
            <span>Post to Earn</span>
          </div>
          {hasStaked ? (
            <p>
              You can receive extra SUB when others like your posts. Feel free to share your post to
              accumulate more rewards.{' '}
              <Link href={activeStakingLinks.learnMore}>
                <a className='FontWeightMedium' target='_blank'>
                  How does it work?
                </a>
              </Link>
            </p>
          ) : (
            <p>
              You can receive extra SUB when others like your posts. However, you need to first
              stake some SUB to become eligible.
            </p>
          )}
        </div>
        {!hasStaked && (
          <Button shape='round' type='primary' href={getSubIdCreatorsLink()} target='_blank'>
            Stake SUB
          </Button>
        )}
      </div> */}
    </Modal>
  )
}
