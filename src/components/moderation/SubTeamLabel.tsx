import clsx from 'clsx'
import { CSSProperties } from 'react'
import { useIsAdmin } from 'src/rtk/features/moderation/hooks'

export default function SubTeamLabel({
  address,
  className,
  style,
}: {
  address: string
  className?: string
  style?: CSSProperties
}) {
  const isAdmin = useIsAdmin(address)
  if (!isAdmin) return null

  return (
    <div
      className={clsx('RoundedHuge', className)}
      style={{ padding: '0.125rem 0.5rem', background: '#F8FAFC', ...style }}
    >
      <span
        className='FontTiny'
        style={{
          color: 'transparent',
          display: 'block',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundImage: 'linear-gradient(94deg, #FB339E 3.57%, #DB35F8 102.73%)',
          WebkitTextFillColor: 'transparent',
        }}
      >
        SUB Team
      </span>
    </div>
  )
}
