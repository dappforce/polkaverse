import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useIsAdmin } from 'src/rtk/features/moderation/hooks'
import { parseGrillMessage } from 'src/utils/iframe'
import { useMyAddress } from '../auth/MyAccountsContext'
import GrillIframeModal from '../utils/GrillIframe'

type State = {
  openModal: (postId: string) => void
}

const Context = React.createContext<State>({ openModal: () => undefined })

export default function ModerationProvider({ children }: { children: ReactNode }) {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const myAddress = useMyAddress()
  const isAdmin = useIsAdmin(myAddress)

  useEffect(() => {
    const listener = (event: MessageEvent<any>) => {
      const message = parseGrillMessage(event.data + '')
      if (!message) return

      const { name, value } = message
      if (name === 'moderation' && value === 'close') {
        setIsOpenModal(false)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
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
      {isAdmin && (
        <GrillIframeModal
          pathname='/widget/moderation'
          style={{ zIndex: 20 }}
          isOpen={isOpenModal}
          ref={iframeRef}
        />
      )}
    </Context.Provider>
  )
}

export function useModerationContext() {
  return React.useContext(Context)
}
