import { Button } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getCurrentUrlOrigin } from 'src/utils/url'

function parseMessage(data: string) {
  const match = data.match(/^([^:]+):([^:]+):(.+)$/)
  if (!match) return null

  const origin = match[1]
  const name = match[2]
  const value = match[3]
  if (origin !== 'grill') return null
  return { name: name ?? '', value: value ?? '' }
}

type CreateChatModalButtonProps = {
  size?: 'small' | 'middle' | 'large'
  spaceId: string
}

const CreateChatModalButton = ({ size, spaceId }: CreateChatModalButtonProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    window.onmessage = event => {
      const message = parseMessage(event.data + '')

      if (!message) return

      const { name, value } = message
      if (name === 'create-chat' && value === 'close') {
        setOpenModal(false)
      } else if (name === 'redirect') {
        router.push(value)
        setOpenModal(false)
      } else if (name === 'redirect-hard') {
        // Using router push for redirect don't redirect properly, it just have loading for a bit and changes the url much later
        window.location.href = value
        setOpenModal(false)
      }
    }
  }, [])

  return (
    <span
      onClick={() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'grill:create-chat',
            payload: `open|${spaceId}`,
          },
          '*',
        )
        setOpenModal(true)
      }}
      className='DfCurrentAddress icon CursorPointer'
    >
      <Button size={size} type='primary' ghost>
        Create chat
      </Button>
      {createPortal(
        <iframe
          ref={iframeRef}
          src={`${getCurrentUrlOrigin()}/c/widget/create-chat?theme=light`}
          style={{
            opacity: openModal ? 1 : 0,
            pointerEvents: openModal ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            colorScheme: 'none',
            background: 'transparent',
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 13,
          }}
        />,
        document?.body,
      )}
    </span>
  )
}

export default CreateChatModalButton
