import { Affix } from 'antd'
import { PropsWithChildren } from 'react'
import { BareProps } from 'src/components/utils/types'
import { HasEditorProps, ToolbarBtn, toolbarItemsProps } from './components'

const StickyComponent = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <Affix offsetTop={64} style={{ height: 0 }}>
        {children}
      </Affix>
      {children}
    </>
  )
}

type ToolBarProps = BareProps &
  HasEditorProps & {
    sticky?: boolean
  }

export const ToolBar = ({ editor, className, sticky }: ToolBarProps) => {
  const toolbarItems = toolbarItemsProps.map(
    ({ Component = ToolbarBtn, getIsActive, ...props }) => {
      const isActive = !!getIsActive && !!editor && getIsActive(editor)

      return <Component key={props.name} editor={editor} isActive={isActive} {...props} />
    },
  )

  const toolbar = <div className={`DfToolbar ${className}`}>{toolbarItems}</div>

  return sticky ? <StickyComponent>{toolbar}</StickyComponent> : toolbar
}

export default ToolBar
