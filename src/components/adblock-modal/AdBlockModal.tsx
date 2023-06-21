// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useDetectAdBlock } from 'adblock-detect-react'
import { Button, Modal } from 'antd'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import config from 'src/config'

const ADBLOCK_SETTING_KEY = 'df.dontShowAdBlockModal'

type ModalProps = {
  open: boolean
  onClose: () => void
}

const AdBlockModalView = (props: ModalProps) => {
  const { open, onClose } = props

  return (
    <Modal closable={false} visible={open} footer={null} width={450} className='text-center'>
      <div>
        <div className='pt-3'>
          <h3 className='font-weight-bold'>You are using an ad blocker 😔</h3>
          <p>
            This may cause some connection issues with {config.appName}. Disabling the ad block will
            enhance your experience since we do not show any ads.
          </p>
          <div className='d-flex'>
            <Button className='m-2' size='large' onClick={onClose} block>
              No, thanks
            </Button>
            <Button
              className='m-2'
              type='primary'
              size='large'
              onClick={() => Router.reload()}
              block
            >
              Done! Reload page
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const AdBlockModal = () => {
  const adBlockDetected = useDetectAdBlock()
  const [showAdBlockModal, setShowAdBlockModal] = useState(false)

  useEffect(() => {
    const adBlockSetting = localStorage.getItem(ADBLOCK_SETTING_KEY)
    if (adBlockSetting === null) {
      setShowAdBlockModal(true)
    }
  }, [])

  const setAdBlockSetting = () => {
    localStorage.setItem(ADBLOCK_SETTING_KEY, 'true')
    setShowAdBlockModal(false)
  }

  return <AdBlockModalView onClose={setAdBlockSetting} open={adBlockDetected && showAdBlockModal} />
}

export default AdBlockModal
