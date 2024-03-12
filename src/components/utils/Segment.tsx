import { FC, forwardRef, ReactNode } from 'react'
import { BareProps } from './types'

export const Segment: FC<BareProps & { ref?: any }> = forwardRef<
  HTMLDivElement,
  BareProps & { children?: ReactNode }
>(({ children, style, className }, ref) => (
  <div className={`DfSegment ${className}`} style={style} ref={ref}>
    {children}
  </div>
))

export default Segment
