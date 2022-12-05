import { SimpleMDEEditorProps } from 'react-simplemde-editor'

export type AutoSaveId = 'space' | 'post' | 'profile'

export type MdEditorProps = Omit<SimpleMDEEditorProps, 'onChange'> & {
  onChange?: (value: string) => any | void
  autoSaveId?: AutoSaveId
  autoSaveIntervalMillis?: number
  isCommentMode?: boolean
}

export type OnUploadImageType = (
  image: File,
  onSuccess: (url: string) => void,
  onError: (errorMessage: string) => void,
) => void
