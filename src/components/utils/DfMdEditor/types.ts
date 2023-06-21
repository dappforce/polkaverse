// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
