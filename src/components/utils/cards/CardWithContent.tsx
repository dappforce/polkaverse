import clsx from 'clsx'
import { useResponsiveSize } from 'src/components/responsive'
import { MutedSpan } from '../MutedText'
import DfCard, { DfCardProps } from './DfCard'

export interface CardWithContentProps extends Omit<DfCardProps, 'title'> {
  avatar?: JSX.Element

  title: string | JSX.Element
  subtitle?: string | JSX.Element
  actions?: JSX.Element

  moveActionsToBottomInMobile?: boolean
}

export default function CardWithContent({
  title,
  subtitle,
  actions,
  avatar,
  children,
  moveActionsToBottomInMobile = true,
  ...props
}: CardWithContentProps) {
  const { isNotMobile } = useResponsiveSize()

  return (
    <DfCard {...props}>
      <div className={clsx('d-flex w-100')}>
        <div className={clsx(!isNotMobile ? 'mt-2' : '')}>{avatar}</div>
        <div className={clsx('d-flex flex-column w-100', avatar && 'ml-1')}>
          <div
            className={clsx(
              'd-flex justify-content-between',
              'align-items-center',
              'w-100',
              'mb-2',
            )}
          >
            <div className={clsx('d-flex align-items-center', 'FontBig font-weight-semibold')}>
              {title}
            </div>
            {(isNotMobile || !moveActionsToBottomInMobile) && <div>{actions}</div>}
          </div>
          {subtitle && <MutedSpan>{subtitle}</MutedSpan>}
          {children}
          {!isNotMobile && moveActionsToBottomInMobile && <div className={'mt-3'}>{actions}</div>}
        </div>
      </div>
    </DfCard>
  )
}
