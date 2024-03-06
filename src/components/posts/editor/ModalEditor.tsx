import { LoadingOutlined } from '@ant-design/icons'
import { IpfsContent } from '@subsocial/api/substrate/wrappers'
import { newLogger } from '@subsocial/utils'
import { Button, Col, Form, Modal, ModalProps, Row } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import BN from 'bignumber.js'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { BiImage } from 'react-icons/bi'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { htmlToMd } from 'src/components/editor/tiptap'
import CustomLink from 'src/components/referral/CustomLink'
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
import { getNeededLock, MINIMUM_LOCK } from 'src/config/constants'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useSendEvent } from 'src/providers/AnalyticContext'
import {
  useFetchSpaces,
  useSelectProfile,
  useSelectSpaceIdsWhereAccountCanPost,
} from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { AnyId, DataSourceTypes, IpfsCid, PostContent } from 'src/types'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { activeStakingLinks, getContentStakingLink } from 'src/utils/links'
import { RegularPostExt } from '.'
import { fieldName, FormValues } from './Fileds'
import styles from './index.module.sass'
import { useAutoSaveFromForm } from './utils'

const HtmlEditor = dynamic(() => import('./HtmlEditor'), {
  ssr: false,
})

const log = newLogger('ModalEditor')

export function useDefaultSpaceIdToPost(defaultSpaceId?: string) {
  const myAddress = useMyAddress()
  const profile = useSelectProfile(myAddress)

  const { getDataForAddress: getLastUsedSpaceId, setData: setLastUsedSpaceId } = useExternalStorage(
    'last-space-id',
    { storageKeyType: 'user' },
  )

  const allowedSpaceIds = useSelectSpaceIdsWhereAccountCanPost(myAddress as string)
  const spaceIdOptions = useMemo(() => {
    if (defaultSpaceId && !allowedSpaceIds.includes(defaultSpaceId))
      return [defaultSpaceId, ...allowedSpaceIds]
    return allowedSpaceIds
  }, [allowedSpaceIds, defaultSpaceId])

  const defaultSpaceIdToPost = useMemo(() => {
    if (defaultSpaceId) return defaultSpaceId
    const lastUsedSpaceId = getLastUsedSpaceId(myAddress ?? '')
    if (getLastUsedSpaceId(myAddress ?? '') && spaceIdOptions.includes(lastUsedSpaceId)) {
      return lastUsedSpaceId
    }
    if (profile && spaceIdOptions.includes(profile?.id ?? '')) {
      return profile?.id
    }
    return spaceIdOptions[0]
  }, [spaceIdOptions, profile, defaultSpaceId])

  return { defaultSpaceIdToPost, setLastUsedSpaceId, spaceIdOptions }
}

export const PostEditorModalBody = ({
  closeModal,
  defaultSpaceId,
}: {
  closeModal: () => void
  defaultSpaceId?: string
}) => {
  const myAddress = useMyAddress()

  const {
    defaultSpaceIdToPost: defaultSpace,
    setLastUsedSpaceId,
    spaceIdOptions,
  } = useDefaultSpaceIdToPost(defaultSpaceId)

  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: spaceIdOptions })
  const [imgUrl, setUrl] = useState<string>()
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [IpfsCid, setIpfsCid] = useState<IpfsCid>()
  const [publishIsDisable, setPublishIsDisable] = useState(true)
  const sendEvent = useSendEvent()

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
        spaceIds={spaceIdOptions}
        defaultValue={defaultSpace}
        imageSize={32}
        onSelect={value => {
          const newId = (value as LabeledValue).value.toString()
          setLastUsedSpaceId(newId, myAddress ?? '')
          setSpaceId(newId)
          sendEvent('createpost_space_changed', {
            from: spaceId,
            to: newId,
            eventSource: 'fastEditor',
          })
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
        <HtmlEditor
          autoFocus
          saveBodyDraft={saveDraft}
          className={clsx(styles.FastEditor, 'ant-input')}
        />
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
            onClick={() =>
              sendEvent('createpost_full_editor_opened', { eventSource: 'fastEditor' })
            }
          >
            Full Editor
          </ButtonLink>
          <TxButton
            onClick={() => sendEvent('createpost_post_published', { eventSource: 'fastEditor' })}
            type='primary'
            disabled={publishIsDisable}
            {...txProps}
          />
        </Col>
      </Row>
    </Form>
  )
}

export interface PostEditorModalProps extends Omit<ModalProps, 'onCancel'> {
  onCancel?: () => void
  defaultSpaceId?: string
}
export const PostEditorModal = ({ defaultSpaceId, ...props }: PostEditorModalProps) => {
  const myAddress = useMyAddress()
  const { data } = useFetchTotalStake(myAddress ?? '')
  const hasStaked = data?.hasStakedEnough
  const totalStake = new BN(data?.amount || 0)

  const neededStake = getNeededLock(data?.amount)

  const sendEvent = useSendEvent()

  return (
    <Modal
      className={styles.ModalEditor}
      closable={false}
      footer={null}
      bodyStyle={{ padding: 0, background: 'transparent', overflow: 'visible' }}
      {...props}
    >
      <div className={styles.Content}>
        <PostEditorModalBody
          defaultSpaceId={defaultSpaceId}
          closeModal={() => props.onCancel && props.onCancel()}
        />
      </div>
      <div className={styles.InfoPanel}>
        <div className={styles.InfoPanelContent}>
          <div className={styles.Title}>
            <div className='d-flex align-items-center GapTiny'>
              <AiFillInfoCircle />
              <span>Post to Earn</span>
            </div>
            {neededStake > 0 && (
              <Button shape='round' type='primary' href={getContentStakingLink()} target='_blank'>
                Lock SUB
              </Button>
            )}
          </div>
          {(() => {
            if (!hasStaked) {
              return (
                <p>
                  You can receive extra SUB when others like your posts or comments. However, you
                  need to first lock at least{' '}
                  <FormatBalance
                    value={MINIMUM_LOCK.toString()}
                    decimals={10}
                    currency='SUB'
                    precision={2}
                  />{' '}
                  SUB to become eligible.
                </p>
              )
            }

            if (totalStake.isZero()) {
              return (
                <p>
                  To start earning SUB rewards, lock by at least{' '}
                  <FormatBalance
                    value={neededStake.toString()}
                    decimals={10}
                    currency='SUB'
                    precision={2}
                  />
                  .
                </p>
              )
            }

            if (neededStake > 0) {
              return (
                <p>
                  To start earning SUB rewards, increase your lock by at least{' '}
                  <FormatBalance
                    value={neededStake.toString()}
                    decimals={10}
                    currency='SUB'
                    precision={2}
                  />
                  .
                </p>
              )
            }

            return (
              <p>
                You can receive extra SUB when others like your content. Share your posts around the
                internet to get more exposure and rewards.{' '}
                <CustomLink href={activeStakingLinks.learnMore}>
                  <a
                    className='FontWeightMedium'
                    target='_blank'
                    onClick={() =>
                      sendEvent('astake_banner_learn_more', { eventSource: 'fastEditor' })
                    }
                  >
                    How does it work?
                  </a>
                </CustomLink>
              </p>
            )
          })()}
        </div>
      </div>
    </Modal>
  )
}
