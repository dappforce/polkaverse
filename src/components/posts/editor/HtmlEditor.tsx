import { EditorContent } from '@tiptap/react'
import { useCreateEditor } from 'src/components/editor/tiptap'
import ToolBar from 'src/components/editor/Toolbar'

export interface HTMLEditorProps {
  onChange?: (htmlText: string) => void
  value?: string
  saveBodyDraft?: (body: string) => void
  className?: string
  showToolbar?: boolean
  autoFocus?: boolean
}

export default function HtmlEditor({
  onChange = () => undefined,
  value,
  saveBodyDraft,
  className,
  showToolbar,
  autoFocus,
}: HTMLEditorProps) {
  const editor = useCreateEditor(onChange, value, saveBodyDraft)

  return (
    <>
      {showToolbar && <ToolBar editor={editor} />}
      <EditorContent autoFocus tabIndex={0} className={className} editor={editor} />
    </>
  )
}
