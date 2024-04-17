import { Button, ButtonProps } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSendEvent } from 'src/stores/analytics'
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

type CreateChatModalButtonProps = ButtonProps & {
  size?: 'small' | 'middle' | 'large'
  spaceId: string
}

const CreateChatModalButton = ({ size, spaceId, ...props }: CreateChatModalButtonProps) => {
  const [createModalIframe, setCreateModalIframe] = useState<HTMLIFrameElement | null>(null)

  const router = useRouter()

  const sendEvent = useSendEvent()

  const closeModal = (iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      iframe.style.opacity = '0'
      iframe.style.pointerEvents = 'none'
    }
  }

  const listener = (event: MessageEvent, iframe: HTMLIFrameElement) => {
    const message = parseMessage(event.data + '')

    if (!message) return

    const { name, value } = message

    if (name === 'create-chat' && value === 'close') {
      closeModal(iframe)
    } else if (name === 'redirect') {
      closeModal(iframe)
      router.push(value)
    } else if (name === 'redirect-hard') {
      closeModal(iframe)
      // Using router push for redirect don't redirect properly, it just have loading for a bit and changes the url much later
      window.location.href = value
    }
  }

  useEffect(() => {
    const modalIframe = createModalIfNotExist()

    if (modalIframe) {
      setCreateModalIframe(modalIframe)
      window.onmessage = event => listener(event, modalIframe)
    }

    return () => {
      let modalIframe = document.getElementById('create-modal-iframe') as HTMLIFrameElement | null

      if (modalIframe) {
        closeModal(modalIframe)
        window.removeEventListener('message', event =>
          listener(event, modalIframe as HTMLIFrameElement),
        )
      }
    }
  }, [])

  return (
    <span
      onClick={() => {
        if (createModalIframe) {
          createModalIframe?.contentWindow?.postMessage(
            {
              type: 'grill:create-chat',
              payload: `open|${spaceId}`,
            },
            '*',
          )

          createModalIframe.style.opacity = '1'
          createModalIframe.style.pointerEvents = 'auto'

          sendEvent('create_chat_clicked', {
            eventSource: router.asPath.includes('/spaces') ? 'my_spaces' : 'profile_page',
          })
        }
      }}
      className='DfCurrentAddress icon CursorPointer'
    >
      <Button size={size} type='primary' ghost {...props}>
        Create chat
      </Button>
    </span>
  )
}

const createModalIfNotExist = () => {
  let modalIframe = document.getElementById('create-modal-iframe') as HTMLIFrameElement | null

  if (!modalIframe) {
    document.body.appendChild(document.createElement('iframe'))

    const iframe = document.querySelector('iframe')

    if (!iframe) return null

    iframe.id = 'create-modal-iframe'
    iframe.src = `${getCurrentUrlOrigin()}/c/widget/create-chat?theme=light`

    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'
    iframe.style.colorScheme = 'none'
    iframe.style.background = 'transparent'
    iframe.style.position = 'fixed'
    iframe.style.inset = '0'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.zIndex = '13'

    return iframe
  } else {
    return modalIframe
  }
}

export default CreateChatModalButton
