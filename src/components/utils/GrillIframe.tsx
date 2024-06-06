import { ComponentProps, forwardRef } from 'react'
import { isDevMode } from 'src/config/env'
import { getCurrentUrlOrigin } from 'src/utils/url'
import urlJoin from 'src/utils/url-join'

const GrillIframeModal = forwardRef<
  HTMLIFrameElement,
  Omit<ComponentProps<'iframe'>, 'src'> & { pathname: string; isOpen: boolean }
>(({ pathname, isOpen, ...props }, ref) => {
  if (isDevMode) return null
  return (
    <iframe
      {...props}
      ref={ref}
      src={urlJoin(getCurrentUrlOrigin(), '/c', pathname, '?theme=light')}
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        display: isOpen ? 'block' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        border: 'none',
        colorScheme: 'none',
        background: 'transparent',
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        ...props.style,
      }}
      allow='clipboard-write'
    />
  )
})
export default GrillIframeModal
