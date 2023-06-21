// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, Card, CardProps } from 'antd'
import clsx from 'clsx'
import { MdContentCopy } from 'react-icons/md'
import { Copy } from 'src/components/urls/helpers'
import { MutedDiv } from '../MutedText'
import styles from './index.module.sass'

export interface CopyTextProps extends CardProps {
  text: string
  message: string
}

export default function CopyText({ text, className, message, ...props }: CopyTextProps) {
  return (
    <Card
      size='small'
      bodyStyle={{ padding: 0, ...props.bodyStyle }}
      className={clsx(styles.CopyTextContainer, className)}
      {...props}
    >
      <MutedDiv className={styles.CopyText}>
        <div className={clsx(styles.CopyTextContent)}>{text}</div>
        <Button type='text' className={clsx(styles.CopyTextButton)}>
          <Copy message={message} text={text}>
            <div className={clsx(styles.CopyTextButtonContent)}>
              <MdContentCopy fontSize='1.3em' />
            </div>
          </Copy>
        </Button>
      </MutedDiv>
    </Card>
  )
}
