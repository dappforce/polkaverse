// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, Row } from 'antd'
import clsx from 'clsx'
import { twitterShareUrl } from 'src/components/urls'
import { openNewWindow } from 'src/components/urls/helpers'
import styles from './index.module.sass'

export interface TwitterMockProps {
  children: any
  twitterText: string
  url: string
  buttonText?: string
  externalBaseUrl?: string
}

export default function TwitterMock({
  children,
  twitterText,
  url,
  externalBaseUrl,
  buttonText = 'Tweet',
}: TwitterMockProps) {
  return (
    <Row justify='center'>
      <Row>
        <div className={clsx(styles.TwitterMock, 'text-left')}>
          <img src='/images/twitter-mock.png' />
          <div className='mt-3'>{children}</div>
        </div>
      </Row>
      <Row justify='space-between' className='w-100'>
        <Button
          type='primary'
          size='large'
          block
          onClick={() => openNewWindow(twitterShareUrl(url, twitterText, { externalBaseUrl }))}
        >
          {buttonText}
        </Button>
      </Row>
    </Row>
  )
}
