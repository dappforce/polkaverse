// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Drawer, Layout } from 'antd'
import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext'
import styles from './Sider.module.sass'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const TopMenu = dynamic(() => import('./TopMenu'), { ssr: false })
const Menu = dynamic(() => import('./SideMenu'), { ssr: false })

const { Header, Sider, Content } = Layout

interface Props {
  children: React.ReactNode
}

const HomeNav = () => {
  const {
    state: { collapsed },
  } = useSidebarCollapsed()

  return (
    <Sider
      className='DfSider'
      width='230'
      collapsedWidth='81'
      trigger={null}
      collapsible
      collapsed={collapsed}
    >
      <Menu />
    </Sider>
  )
}

const DefaultNav: FunctionComponent = () => {
  const {
    state: { collapsed },
    hide,
  } = useSidebarCollapsed()
  const { asPath } = useRouter()

  useEffect(() => hide(), [asPath])
  useEffect(() => {
    document.body.style.overflow = !collapsed ? 'hidden' : 'unset'
  }, [collapsed])

  return (
    <Drawer
      className='DfSideBar'
      bodyStyle={{ padding: 0 }}
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
  const {
    state: { asDrawer },
  } = useSidebarCollapsed()

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
        {asDrawer ? <DefaultNav /> : <HomeNav />}
        {content}
      </Layout>
    </Layout>
  )
}
