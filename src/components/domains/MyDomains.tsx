// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, Modal } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { AiOutlineSetting } from 'react-icons/ai'
import { useMyDomains } from 'src/rtk/features/domains/domainHooks'
import { Domain } from 'src/rtk/features/domains/domainsByOwnerSlice'
import { SubIcon } from '../utils'
import { ButtonLink } from '../utils/CustomLinks'
import { DomainItem } from './DomainItem'
import { useManageDomainContext } from './manage/ManageDomainProvider'

type OpenManageModalProps = {
  domain: string
}

export const MyDomainsCard = () => {
  const { loading, domains } = useMyDomains()
  const { openManageModal } = useManageDomainContext()

  if (loading || !domains.length) return null

  const OpenManageModal = ({ domain }: OpenManageModalProps) => {
    return (
      <div className='d-flex align-items-center'>
        <Button
          type='primary'
          icon={<SubIcon Icon={AiOutlineSetting} />}
          className='fontSizeNormal pt-0 pb-0'
          onClick={() => {
            openManageModal('menu', domain)
          }}
        >
          Manage
        </Button>
      </div>
    )
  }

  const domainsComponents = domains.map((id, i) => {
    return (
      <div key={id} className={clsx({ 'mt-2': i !== 0 })}>
        <DomainItem domain={id} action={<OpenManageModal domain={id} />} />
      </div>
    )
  })

  return <div className='d-flex flex-column GapNormal'>{domainsComponents}</div>
}

type MyDomainsModalProps = {
  visible: boolean
  close: VoidFunction
  domains: Domain[]
}

type GoToManageProps = {
  domain: string
}

const GoToManage = ({ domain }: GoToManageProps) => (
  <ButtonLink
    href={'/dd/:domain'}
    as={`/dd/${domain}`}
    type='primary'
    ghost
    icon={<SubIcon Icon={AiOutlineSetting} />}
  >
    <span className='ml-2'>Manage</span>
  </ButtonLink>
)

const MyDomainsModal = ({ visible, domains, close }: MyDomainsModalProps) => {
  const domainsComponents = domains.map((id, i) => {
    return (
      <div key={id} className={clsx({ 'mt-2': i !== 0 })}>
        <DomainItem domain={id} action={<GoToManage domain={id} />} />
      </div>
    )
  })

  return (
    <Modal title='My Domains' visible={visible} onCancel={close} footer={null}>
      {domainsComponents}
    </Modal>
  )
}

type MyDomainsProps = {
  domains: Domain[]
}

export const MyDomains = ({ domains }: MyDomainsProps) => {
  const [visible, setVisible] = useState(false)

  const close = () => setVisible(false)
  const open = () => setVisible(true)

  return (
    <>
      <a href='#' onClick={open}>
        My domains ({domains.length})
      </a>
      <MyDomainsModal visible={visible} domains={domains} close={close} />
    </>
  )
}
