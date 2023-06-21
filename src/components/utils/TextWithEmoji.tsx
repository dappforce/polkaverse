// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { LocalIcon } from '.'
import { BareProps } from './types'

type TextWithEmojiProps = BareProps & {
  text: string
  emojiPath?: string
  emoji?: string
}

export const TextWithEmoji = ({ text, emoji, emojiPath, className, style }: TextWithEmojiProps) => (
  <span className={className} style={style}>
    <span className='mr-2'>
      {emojiPath && <LocalIcon path={emojiPath} style={{ width: '24px' }} />}
      {emoji}
    </span>
    {text}
  </span>
)
