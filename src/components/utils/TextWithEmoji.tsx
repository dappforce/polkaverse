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
