import grill, { GrillConfig, GrillEventListener } from '@subsocial/grill-widget'
import { Resource } from '@subsocial/resource-discussions'
import { summarizeMd } from '@subsocial/utils'
import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import config from 'src/config'
import useWrapInRef from 'src/hooks/useWrapInRef'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSetChatTotalMessageCount } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { ChatEntity } from 'src/rtk/features/chat/chatSlice'
import { getCurrentWallet } from '../auth/utils'
import styles from './ChatIframe.module.sass'

export type ChatIframeProps = ComponentProps<'div'> & {
  onUnreadCountChange?: (count: number) => void
}

export default function ChatIframe({ onUnreadCountChange, ...props }: ChatIframeProps) {
  const entity = useAppSelector(state => state.chat.entity)
  const sendEvent = useSendEvent()
  const sendEventRef = useWrapInRef(sendEvent)
  const [isLoading, setIsLoading] = useState(false)
  const setChatTotalMessageCount = useSetChatTotalMessageCount()

  useEffect(() => {
    if (!entity) return
    const config = generateGrillConfig(entity)
    if (!config) return
    config.onWidgetCreated = iframe => {
      const currentWallet = getCurrentWallet()
      if (currentWallet) {
        iframe.src = `${iframe.src}&wallet=${currentWallet}`
      }
      iframe.onerror = () => {
        sendEventRef.current('chat_widget_error')
      }
      iframe.onmouseenter = () => {
        sendEventRef.current('chat_widget_mouse_enter')
      }
      return iframe
    }

    const listener: GrillEventListener | undefined = (name, value) => {
      const parsedValue = parseInt(value) ?? 0
      if (name === 'unread') onUnreadCountChange?.(parsedValue)
      else if (name === 'totalMessage') setChatTotalMessageCount(parsedValue)
      else if (name === 'isUpdatingConfig') {
        if (value === 'true') {
          setIsLoading(true)
        } else if (value === 'false') {
          setIsLoading(false)
        }
      }
    }
    if (listener) {
      grill.addMessageListener(listener)
    }

    if (document.contains(grill.instances?.['grill']?.iframe)) {
      grill.setConfig(config)
    } else {
      grill.init(config)
    }

    return () => {
      if (listener) grill.removeMessageListener(listener)
    }
  }, [entity, sendEventRef])

  return (
    <div
      {...props}
      id='grill'
      className={clsx(props.className, styles.ChatIframe, isLoading && styles.ChatIframeLoading)}
    />
  )
}

type CommonSettings = {
  settings: NonNullable<GrillConfig['channel']>['settings']
  root: Partial<GrillConfig>
}

function generateGrillConfig(entity: ChatEntity['entity']): GrillConfig | null {
  if (!entity) return null
  const commonSettings: CommonSettings = {
    root: {
      theme: 'light',
      rootFontSize: '1rem',
    },
    settings: {
      enableLoginButton: true,
      enableInputAutofocus: true,
    },
  }
  if (entity.type === 'post') {
    return generatePostGrillConfig(entity, commonSettings)
  } else if (entity.type === 'space') {
    return generateSpaceGrillConfig(entity, commonSettings)
  }

  return null
}

const creatorsHubId = '1218'
function generateSpaceGrillConfig(
  entity: Extract<ChatEntity['entity'], { type: 'space' }>,
  commonSettings: CommonSettings,
): GrillConfig {
  const space = entity.data
  const { content } = space
  const metadata = {
    title: content?.name ?? '',
    body: content?.about ?? '',
    image: content?.image ?? '',
  }

  return {
    ...commonSettings.root,
    hub: { id: creatorsHubId },
    channel: {
      ...commonSettings.settings,
      type: 'resource',
      resource: new Resource({
        schema: 'chain',
        chainType: 'substrate',
        chainName: 'subsocial',
        resourceType: 'creator',
        resourceValue: {
          id: space.id,
        },
      }),
      metadata,
    },
  }
}

function generatePostGrillConfig(
  entity: Extract<ChatEntity['entity'], { type: 'post' }>,
  commonSettings: CommonSettings,
): GrillConfig {
  const post = entity.data
  const title = summarizeMd(post.content?.title || post.content?.body || '', {
    limit: 50,
  }).summary
  const body = summarizeMd(post.content?.body ?? '', { limit: 50 }).summary

  return {
    ...commonSettings.root,
    hub: { id: config.commentsHubId },
    channel: {
      ...commonSettings.settings,
      type: 'resource',
      resource: new Resource({
        schema: 'social',
        app: 'polkaverse',
        resourceType: 'post',
        resourceValue: {
          id: post.struct.id,
        },
      }),
      metadata: {
        title,
        body,
        image: post.content?.image,
      },
    },
  }
}
