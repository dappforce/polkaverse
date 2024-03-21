import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { isDevMode } from 'src/config/env'
import { parseGrillMessage } from 'src/utils/iframe'
import { getCurrentUrlOrigin } from 'src/utils/url'

type State = {
  openModal: (postId: string) => void
}

const Context = React.createContext<State>({ openModal: () => undefined })

export default function ModerationProvider({ children }: { children: ReactNode }) {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    window.onmessage = event => {
      const message = parseGrillMessage(event.data + '')
      if (!message) return

      const { name, value } = message
      if (name === 'moderation' && value === 'close') {
        setIsOpenModal(false)
      }
    }
  }, [])

  const value = useMemo(() => {
    return {
      openModal: (postId: string) => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'grill:moderate',
            payload: postId,
          },
          '*',
        )
        setIsOpenModal(true)
      },
    }
  }, [])

  return (
    <Context.Provider value={value}>
      {children}
      {!isDevMode && (
        <iframe
          ref={iframeRef}
          src={`${getCurrentUrlOrigin()}/c/widget/moderation?theme=light`}
          style={{
            opacity: isOpenModal ? 1 : 0,
            pointerEvents: isOpenModal ? 'auto' : 'none',
            border: 'none',
            zIndex: 20,
            transition: 'opacity 0.3s ease-in-out',
            colorScheme: 'none',
            background: 'transparent',
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </Context.Provider>
  )
}

export function useModerationContext() {
  return React.useContext(Context)
}
