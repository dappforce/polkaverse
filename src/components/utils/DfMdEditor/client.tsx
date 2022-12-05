import { newLogger, nonEmptyStr } from '@subsocial/utils'
import SimpleMDE from 'easymde'
import { useEffect } from 'react'
import SimpleMDEReact from 'react-simplemde-editor'
import sanitizeHtml from 'sanitize-html'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import store from 'store'
import { AutoSaveId, MdEditorProps, OnUploadImageType } from './types'

const getStoreKey = (id: AutoSaveId) => `smde_${id}`

const log = newLogger('UploadImage')

/** Get auto saved content for MD editor from the browser's local storage. */
const getAutoSavedContent = (id?: AutoSaveId): string | undefined => {
  return id ? store.get(getStoreKey(id)) : undefined
}

export const clearAutoSavedContent = (id: AutoSaveId) => store.remove(getStoreKey(id))

const AUTO_SAVE_INTERVAL_MILLIS = 5000

const MdEditor = ({
  className,
  options = {},
  events = {},
  onChange = () => void 0,
  value,
  autoSaveId,
  autoSaveIntervalMillis = AUTO_SAVE_INTERVAL_MILLIS,
  ...otherProps
}: MdEditorProps) => {
  const { toolbar = true, ...otherOptions } = options

  const autosavedContent = getAutoSavedContent(autoSaveId)

  const classToolbar = !toolbar && 'hideToolbar'

  const autosave = autoSaveId
    ? {
        enabled: true,
        uniqueId: autoSaveId,
        delay: autoSaveIntervalMillis,
      }
    : undefined

  const { ipfs } = useSubsocialApi()

  const onUploadImage: OnUploadImageType = async (image, onSuccess, onError) => {
    try {
      const imageName = image.name
      const ext = imageName.substring(imageName.lastIndexOf('.') + 1).replace(/\?.*$/, '')
      const cid = await ipfs.saveFileToOffchain(image)
      const imageUrl = `${config.ipfsNodeUrl}/ipfs/${cid}?type=.${ext}`
      onSuccess(imageUrl)
    } catch (err) {
      const errorMessage = 'Failed to upload the image'
      log.error(errorMessage, err)
      onError(errorMessage)
    }
  }

  const newOptions = {
    previewClass: 'markdown-body',
    placeholder: 'Write something...',
    autosave,
    status: [],
    spellChecker: false,
    toolbarTips: true,
    toolbar: [
      'bold',
      'italic',
      'heading-2',
      'unordered-list',
      'code',
      'quote',
      'horizontal-rule',
      'link',
      'upload-image',
      '|',
      'preview',
    ],
    uploadImage: true,
    imageUploadFunction: onUploadImage,
    shortcuts: { toggleFullScreen: null, toggleSideBySide: null },
    renderingConfig: {
      sanitizerFunction: (html: string) =>
        sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'del']),
        }),
    },
    ...otherOptions,
  } as SimpleMDE.Options

  useEffect(() => {
    if (autosave && nonEmptyStr(autosavedContent)) {
      // Need to trigger onChange event to notify a wrapping Ant D. form
      // that this editor received a value from local storage.
      onChange(autosavedContent)
    }
  }, [])

  const setFocus = (md: SimpleMDE) => newOptions.autofocus && md.codemirror.focus()

  return (
    <SimpleMDEReact
      className={`DfMdEditor ${classToolbar} ${className}`}
      value={value}
      events={events}
      onChange={onChange}
      options={newOptions}
      getMdeInstance={setFocus}
      {...otherProps}
    />
  )
}

export default MdEditor
