import { Input } from 'antd'
import dynamic from 'next/dynamic'
import { isClientSide } from '..'
import { MdEditorProps } from './types'

const ClientMdEditor = dynamic(import('./client'), { ssr: false })

const TextAreaStub = (props: Omit<MdEditorProps, 'onChange'>) => (
  <Input.TextArea {...props} style={{ height: '120px' }} />
)

/**
 * MdEditor is based on CodeMirror that is a large dependency: 55 KB (gzipped).
 * Do not use MdEditor on server side, becasue we don't need it there.
 * That's why we import editor dynamically only on the client side.
 */
function Inner(props: MdEditorProps) {
  return isClientSide() ? <ClientMdEditor {...props} /> : <TextAreaStub />
}

export default Inner
