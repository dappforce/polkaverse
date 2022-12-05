import { isEmptyArray } from '@subsocial/utils'
import { Affix, Card, Col, Form, FormInstance, Input, Row, Switch, Tabs } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { htmlToMd } from 'src/components/editor/tiptap'
import { maxLenError, minLenError } from 'src/components/forms'
import { useResponsiveSize } from 'src/components/responsive'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import MdEditor from 'src/components/utils/DfMdEditor/client'
import NoData from 'src/components/utils/EmptyList'
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview'
import TxButton from 'src/components/utils/TxButton'
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

const AFFIX_OFFSET = 85
const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

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
}: EditorCardProps) => {
  const [fixedToolbar, setFixedToolbar] = useState(false)
  const { isMobile } = useResponsiveSize()

  const toggleMarkdownMode = () => {
    const newState = !markdownMode
    setMarkdownMode(newState)
    localStorage.setItem(ENABLE_MARKDOWN_MODE_KEY, String(newState))
  }

  const onChangeHtmlEditor = (text: string) => {
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

      {/* trigger is removed because for body, we want to use the onChange only, where it also sets the form body data. By doing this, the form body data won't be changed twice */}
      <Form.Item
        name={fieldName('body')}
        trigger=''
        className={clsx('mb-0', styles.EditorFormItem)}
      >
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
            showToolbar={!isMobile}
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
  defaultSpaceId?: SpaceId
}

const FullEditor = ({
  txProps,
  form,
  setSpaceForPost,
  initialValues,
  postType,
  defaultSpaceId,
}: EditorProps) => {
  const myAddress = useMyAddress()
  const allowedSpaceIds = useSelectSpaceIdsWhereAccountCanPost(myAddress as string)
  const router = useRouter()
  const {
    query: { tab = 'article', ...queries },
  } = router
  const [publishIsDisable, setPublishIsDisable] = useState(true)
  const [markdownMode, setMarkdownMode] = useState(getMarkdownModeFromLocalStore())
  const { saveContent } = useAutoSaveFromForm({ entity: 'post' })

  const type: PostType = postType || (tab?.toString() as PostType)

  function onBodyChanged(text: string) {
    form.setFieldsValue({ [fieldName('body')]: text })
    handleChange()
  }

  const defaultSpace = defaultSpaceId || allowedSpaceIds[0]

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
      <Row gutter={[16, 16]} justify='center'>
        <Col>
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
                  <TabPane key='link' tab='Video' />
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
                      setSpaceForPost((value as LabeledValue).value.toString())
                    }}
                  />
                </div>
                <TxButton
                  size='large'
                  type='primary'
                  block
                  className='mt-3'
                  disabled={publishIsDisable}
                  {...txProps}
                />
              </Card>
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
