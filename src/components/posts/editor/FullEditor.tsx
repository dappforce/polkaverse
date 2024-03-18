import { isEmptyArray } from '@subsocial/utils'
import { Affix, Button, Card, Col, Form, FormInstance, Input, Row, Switch, Tabs } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { IoInformationCircle } from 'react-icons/io5'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { htmlToMd } from 'src/components/editor/tiptap'
import { maxLenError, minLenError } from 'src/components/forms'
import { useResponsiveSize } from 'src/components/responsive'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import MdEditor from 'src/components/utils/DfMdEditor/client'
import NoData from 'src/components/utils/EmptyList'
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview'
import TxButton from 'src/components/utils/TxButton'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useSelectSpaceIdsWhereAccountCanPost } from 'src/rtk/features/spaceIds/spaceIdsHooks'
import { PostContent, SpaceId } from 'src/types'
import { PostType } from '.'
import { setTabInUrl } from '../../main/utils'
import { UploadCover } from '../../uploader'
import { canonicalField, EmbeddedLinkField, fieldName, FormValues, TagField } from './Fileds'
import HtmlEditor from './HtmlEditor'
import styles from './index.module.sass'
import { useAutoSaveFromForm } from './utils'

const ENABLE_MARKDOWN_MODE_KEY = 'df.enableMarkdownMode'

const getMarkdownModeFromLocalStore = () =>
  localStorage.getItem(ENABLE_MARKDOWN_MODE_KEY) === 'true'

const AFFIX_OFFSET = 76
const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 500

const { TabPane } = Tabs

type onChangeFn = (text: string) => void

type DoubleEditorProps = {
  onChange: onChangeFn
  value?: string
  saveBodyDraft: (body: string) => void
}

type EditorCardProps = DoubleEditorProps & {
  markdownMode: boolean
  setMarkdownMode: (markdown: boolean) => void
  form: FormInstance
  saveBodyDraft: (body: string) => void
}

const EditorCard = ({
  setMarkdownMode,
  markdownMode,
  onChange,
  saveBodyDraft,
  form,
}: EditorCardProps) => {
  const [fixedToolbar, setFixedToolbar] = useState(false)
  const { isMobile } = useResponsiveSize()

  const toggleMarkdownMode = () => {
    const newState = !markdownMode
    setMarkdownMode(newState)
    localStorage.setItem(ENABLE_MARKDOWN_MODE_KEY, String(newState))
  }

  const onChangeHtmlEditor = (text: string) => {
    console.log('iudjfhgsuiydfgiuy', text)
    const mdText = htmlToMd(text) || ''
    onChange(mdText)
  }

  const saveDraftHtmlEditor = (text: string) => {
    const mdText = htmlToMd(text) || ''
    saveBodyDraft(mdText)
  }

  return (
    <Card className={clsx(styles.EditorBodyContent, { [styles.FixedToolbar]: fixedToolbar })}>
      {!isMobile && (
        <Affix
          offsetTop={AFFIX_OFFSET}
          onChange={affixed => setFixedToolbar(!!affixed)}
          className={styles.SwitchEditorButton}
        >
          <div className='d-flex align-items-center'>
            <span className='mr-2'>Markdown Mode: </span>
            <Switch checked={markdownMode} onClick={toggleMarkdownMode} />
          </div>
        </Affix>
      )}

      <Form.Item name={fieldName('body')} className={clsx('mb-0', styles.EditorFormItem)}>
        {markdownMode ? (
          <MdEditor
            onChange={onChange}
            options={{ autofocus: true }}
            className={styles.BorderLessMdEditor}
          />
        ) : (
          <HtmlEditor
            onChange={onChangeHtmlEditor}
            saveBodyDraft={saveDraftHtmlEditor}
            showToolbar
          />
        )}
      </Form.Item>
    </Card>
  )
}

export type EditorProps = {
  form: FormInstance
  txProps: TxButtonProps
  setSpaceForPost: (spaceId?: string) => void
  initialValues: FormValues
  postType?: PostType
  spaceForPost?: SpaceId
}

const FullEditor = ({
  txProps,
  form,
  setSpaceForPost,
  initialValues,
  postType,
  spaceForPost,
}: EditorProps) => {
  const myAddress = useMyAddress()
  const allowedSpaceIds = useSelectSpaceIdsWhereAccountCanPost(myAddress as string)
  const router = useRouter()
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const {
    query: { tab = 'article', ...queries },
  } = router
  const [publishIsDisable, setPublishIsDisable] = useState(true)
  const [markdownMode, setMarkdownMode] = useState(getMarkdownModeFromLocalStore())
  const { saveContent } = useAutoSaveFromForm({ entity: 'post' })
  const sendEvent = useSendEvent()

  useEffect(() => {
    sendEvent('createpost_editor_mode', { value: markdownMode ? 'md' : 'html' })
  }, [markdownMode])

  const type: PostType = postType || (tab?.toString() as PostType)

  function onBodyChanged(text: string) {
    console.log(text)
    form.setFieldsValue({ [fieldName('body')]: text })
    handleChange()
  }

  const defaultSpace = spaceForPost || allowedSpaceIds[0]

  useEffect(() => {
    setSpaceForPost(defaultSpace)
  }, [defaultSpace])

  if (isEmptyArray(allowedSpaceIds)) return <NoData description='You need to create a space' />

  const onTabChange = (key: string) => setTabInUrl(router, key, queries as Record<string, string>)

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  const tags = initialValues.tags || []

  const saveDraft = (content: PostContent) => {
    setPublishIsDisable(!content.body)
    saveContent(content)
  }

  const handleChange = () => {
    const content = form.getFieldsValue() as PostContent
    saveDraft(content)
  }

  const saveBodyDraft = (body: string) => {
    const content = form.getFieldsValue() as PostContent
    content.body = body
    saveContent(content)
  }

  const isSpaceSelectorDisabled = !!postType

  return (
    <Form form={form} layout='vertical' initialValues={initialValues} onFieldsChange={handleChange}>
      <Row className={styles.EditorContainer} gutter={[16, 16]} justify='center'>
        <Col
          style={{ minWidth: 0 }}
          className={clsx(
            'd-flex align-items-stretch flex-column',
            styles.EditorBodyContentContainer,
          )}
        >
          <Card className={clsx(styles.EditorBodyContent, 'mb-3')}>
            <Form.Item
              name={fieldName('title')}
              className='mb-0'
              validateTrigger='onBlur'
              rules={[
                {
                  min: TITLE_MIN_LEN,
                  message: minLenError('Post title', TITLE_MIN_LEN),
                },
                {
                  max: TITLE_MAX_LEN,
                  message: maxLenError('Post title', TITLE_MAX_LEN),
                },
              ]}
            >
              <Input
                onBlur={e => form.setFieldsValue({ [fieldName('title')]: e.target.value.trim() })}
                placeholder='Title'
                className={styles.TitleInput}
              />
            </Form.Item>
            <div className={styles.CoverSection}>
              {!postType && (
                <Tabs
                  tabPosition='top'
                  onChange={onTabChange}
                  defaultActiveKey={type}
                  className='mb-2'
                >
                  <TabPane key='article' tab='Cover Image' />
                  <TabPane key='link' tab='Link' />
                </Tabs>
              )}
              {type === 'article' && (
                <Form.Item name={fieldName('image')} className='mb-0'>
                  <UploadCover
                    data-cy='image-input'
                    onChange={onAvatarChanged}
                    img={initialValues?.image}
                    placeholder={
                      <>
                        <b>Drag & drop here</b> or <b>click to upload</b>
                      </>
                    }
                    extraPlaceHolder='We recommend uploading an image with a pixel size of 1280 x 720 and less than 2 mb.'
                    uploadClassName={styles.UploadHint}
                  />
                </Form.Item>
              )}
              {type === 'link' && <EmbeddedLinkField form={form} />}
            </div>
          </Card>
          <EditorCard
            form={form}
            markdownMode={markdownMode}
            setMarkdownMode={setMarkdownMode}
            onChange={onBodyChanged}
            saveBodyDraft={saveBodyDraft}
          />
        </Col>
        <Col>
          <Affix offsetTop={AFFIX_OFFSET}>
            <div className={styles.ToolsSection}>
              <Card className={styles.AdvancedBody}>
                <div className={clsx(!isSpaceSelectorDisabled && styles.SelectorContainer)}>
                  <SelectSpacePreview
                    className={clsx(styles.SpaceSelector)}
                    spaceIds={allowedSpaceIds}
                    defaultValue={defaultSpace}
                    disabled={!!postType}
                    imageSize={32}
                    onSelect={value => {
                      const id = (value as LabeledValue).value.toString()
                      setSpaceForPost((value as LabeledValue).value.toString())
                      sendEvent('createpost_space_changed', {
                        eventSource: 'fullEditor',
                        from: spaceForPost,
                        to: id,
                      })
                    }}
                  />
                </div>
                <TxButton
                  onClick={() =>
                    sendEvent('createpost_post_published', { eventSource: 'fullEditor' })
                  }
                  size='large'
                  type='primary'
                  block
                  className='mt-3'
                  disabled={publishIsDisable}
                  {...txProps}
                />
              </Card>
              {!totalStake?.hasStakedEnough && (
                <div className={clsx('mb-3', styles.PostToEarnCard, styles.AdvancedBody)}>
                  <div className='d-flex align-items-center GapTiny FontNormal mb-2'>
                    <IoInformationCircle
                      className='FontLarge'
                      style={{ color: 'rgb(96, 165, 250)' }}
                    />
                    <span className='FontWeightBold'>Post to Earn</span>
                  </div>
                  <p className='FontSmall mb-3'>
                    You can receive extra SUB when others like your posts or comments. However, you
                    need to first lock at least 2,000 SUB to become eligible.
                  </p>
                  <a href='/c/staking'>
                    <Button type='primary' ghost className='RoundedHuge'>
                      Lock SUB
                    </Button>
                  </a>
                </div>
              )}
              <Card className={clsx(styles.AdvancedBody)}>
                <TagField tags={tags} />
                {canonicalField}
              </Card>
            </div>
          </Affix>
        </Col>
      </Row>
    </Form>
  )
}

export default FullEditor
