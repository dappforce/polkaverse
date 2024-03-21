import { Drawer, Layout } from 'antd'
import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext'
import styles from './Sider.module.sass'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import useIsMounted from 'src/hooks/useIsMounted'

const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false })
const Menu = dynamic(() => import('./SideMenu'), { ssr: false })

const {
  Header,
  // Sider
  Content,
} = Layout

interface Props {
  children: React.ReactNode
}

// const HomeNav = () => {
//   const {
//     state: { collapsed },
//   } = useSidebarCollapsed()

//   return (
//     <Sider
//       className='DfSider'
//       width='230'
//       collapsedWidth='81'
//       trigger={null}
//       collapsible
//       collapsed={collapsed}
//     >
//       <Menu />
//     </Sider>
//   )
// }

const DefaultNav: FunctionComponent = () => {
  const {
    state: { collapsed },
    hide,
  } = useSidebarCollapsed()
  const { asPath } = useRouter()
  const isMounted = useIsMounted()

  useEffect(() => hide(), [asPath])
  useEffect(() => {
    document.body.style.overflow = !collapsed ? 'hidden' : 'unset'
  }, [collapsed])

  if (!isMounted) return null

  return (
    <Drawer
      className='DfSideBar'
      bodyStyle={{ padding: 0, paddingLeft: '12px' }}
      placement='left'
      closable={false}
      onClose={hide}
      visible={!collapsed}
      getContainer={false}
      keyboard
    >
      <Menu />
    </Drawer>
  )
}

export const Navigation = (props: Props): JSX.Element => {
  const { children } = props

  const content = useMemo(
    () => <Content className={clsx('DfPageContent', styles.PagePadding)}>{children}</Content>,
    [children],
  )

  return (
    <Layout className='min-vh-100'>
      <Header className='DfHeader'>
        <TopMenu />
      </Header>
      <Layout className='ant-layout-has-sider'>
        <DefaultNav />
        {content}
      </Layout>
    </Layout>
  )
}
