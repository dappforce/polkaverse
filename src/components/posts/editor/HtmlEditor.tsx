// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { EditorContent } from '@tiptap/react'
import { useCreateEditor } from 'src/components/editor/tiptap'
import ToolBar from 'src/components/editor/Toolbar'

export interface HTMLEditorProps {
  onChange?: (htmlText: string) => void
  value?: string
  saveBodyDraft?: (body: string) => void
  className?: string
  showToolbar?: boolean
}

export default function HtmlEditor({
  onChange = () => undefined,
  value,
  saveBodyDraft,
  className,
  showToolbar,
}: HTMLEditorProps) {
  const editor = useCreateEditor(onChange, value, saveBodyDraft)

  return (
    <>
      {showToolbar && <ToolBar editor={editor} />}
      <EditorContent tabIndex={0} className={className} editor={editor} />
    </>
  )
}
