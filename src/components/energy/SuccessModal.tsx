// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Modal } from 'antd'
import clsx from 'clsx'
import config from 'src/config'
import { subsocialUrl } from '../urls'
import TwitterMock from '../utils/TwitterMock'
import { ModalProps } from '../utils/types'

type EnergySuccessModalProps = ModalProps

const twitterText =
  'I just burned $SUB to create energy on @SubsocialChain, allowing me to perform more actions!'

export const EnergySuccessModal = ({ open, hide }: EnergySuccessModalProps) => {
  return (
    <Modal
      style={{ width: 520 }}
      visible={open}
      onCancel={hide}
      footer={null}
      title={<div className='font-weight-bold my-2 FontLarge'>🎉 Energy Generated</div>}
      width={540}
      className={clsx('text-center DfSignInModal')}
      destroyOnClose
    >
      <div className='pl-4 pr-4 pb-4'>
        <TwitterMock url='/energy' twitterText={twitterText}>
          <p>
            I just burned <a>$SUB</a> to create energy on <a>@SubsocialChain</a>, allowing me to
            perform more actions!
            <br />
            <a>{subsocialUrl('/energy')}</a>
          </p>
          <a>#{config.appName} #Subsocial</a>
        </TwitterMock>
      </div>
    </Modal>
  )
}
