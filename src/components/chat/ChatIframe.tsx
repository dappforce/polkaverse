import grill, { GrillConfig, GrillEventListener } from '@subsocial/grill-widget'
import { Resource } from '@subsocial/resource-discussions'
import { summarize } from '@subsocial/utils'
import clsx from 'clsx'
import { ComponentProps, useEffect } from 'react'
import useWrapInRef from 'src/hooks/useWrapInRef'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSetChatTotalMessageCount } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { ChatEntity } from 'src/rtk/features/chat/chatSlice'

export type ChatIframeProps = ComponentProps<'div'> & {
  onUnreadCountChange?: (count: number) => void
}

const COMMENTS_HUB_ID = '1032'

export default function ChatIframe({ onUnreadCountChange, ...props }: ChatIframeProps) {
  const entity = useAppSelector(state => state.chat.entity)
  const sendEvent = useSendEvent()
  const sendEventRef = useWrapInRef(sendEvent)
  const setChatTotalMessageCount = useSetChatTotalMessageCount()

  useEffect(() => {
    if (!entity) return
    const config = generateGrillConfig(entity)
    if (!config) return
    config.onWidgetCreated = iframe => {
      iframe.onerror = () => {
        sendEventRef.current('chat_widget_error')
      }
      iframe.onmouseenter = () => {
        sendEventRef.current('chat_widget_mouse_enter')
      }
      return iframe
    }

    const listener: GrillEventListener | undefined = onUnreadCountChange
      ? (name, value) => {
          const parsedValue = parseInt(value) ?? 0
          if (name === 'unread') onUnreadCountChange(parsedValue)
          else if (name === 'totalMessage') setChatTotalMessageCount(parsedValue)
        }
      : undefined
    if (listener) {
      grill.addUnreadCountListener(listener)
    }

    grill.init(config)

    return () => {
      if (listener) grill.removeUnreadCountListener(listener)
    }
  }, [entity, sendEventRef])

  return <div {...props} id='grill' className={clsx(props.className)} />
}

function generateGrillConfig(entity: ChatEntity['entity']): GrillConfig | null {
  if (!entity) return null
  if (entity.type === 'post') {
    const post = entity.data
    const title = summarize(post.content?.title ?? post.content?.body ?? '', { limit: 50 })
    const body = summarize(post.content?.body ?? '', { limit: 50 })
    return {
      hub: {
        id: COMMENTS_HUB_ID,
      },
      theme: 'light',
      rootFontSize: '1rem',
      channel: {
        type: 'resource',
        resource: new Resource({
          schema: 'social',
          app: 'polkaverse',
          resourceType: 'post',
          resourceValue: {
            id: post.struct.id,
          },
        }),
        settings: {
          enableLoginButton: true,
          enableInputAutofocus: true,
        },
        metadata: {
          title,
          body,
          image: post.content?.image,
        },
      },
    }
  }

  return null
}
