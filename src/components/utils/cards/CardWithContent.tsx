import clsx from 'clsx'
import { Fragment } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import { MutedSpan } from '../MutedText'
import styles from './CardWithContent.module.sass'
import DfCard, { DfCardProps } from './DfCard'

export interface CardWithContentProps extends Omit<DfCardProps, 'title'> {
  avatar?: JSX.Element

  title: string | JSX.Element
  subtitle?: string | JSX.Element
  actions?: JSX.Element
  buttons?: (JSX.Element | undefined | null | boolean)[]

  moveActionsToBottomInMobile?: boolean
}

export default function CardWithContent({
  title,
  subtitle,
  actions,
  avatar,
  children,
  moveActionsToBottomInMobile = true,
  buttons,
  ...props
}: CardWithContentProps) {
  const { isNotMobile } = useResponsiveSize()
  const actionsContent =
    actions || buttons?.map((el, idx) => <Fragment key={idx}>{el || null}</Fragment>)

  return (
    <DfCard {...props}>
      <div className={clsx(styles.CardWithContent, 'd-flex w-100')}>
        <div className={clsx('mt-2', isNotMobile ? '' : 'mb-2', styles.Avatar)}>{avatar}</div>
        <div className={clsx('d-flex flex-column w-100', avatar && 'ml-1')}>
          <div
            className={clsx(
              'd-flex justify-content-between',
              'align-items-center',
              'w-100',
              'mb-2',
              styles.TitleContainer,
            )}
          >
            <div
              className={clsx(
                'd-flex align-items-center',
                'FontBig font-weight-semibold',
                styles.Title,
              )}
            >
              {title}
            </div>
            {(isNotMobile || !moveActionsToBottomInMobile) && (
              <div className='d-flex align-items-center'>{actionsContent}</div>
            )}
          </div>
          {subtitle && <MutedSpan>{subtitle}</MutedSpan>}
          {children}
          {!isNotMobile && moveActionsToBottomInMobile && (
            <div className={clsx('mt-3', actions ? '' : styles.ButtonsContainer)}>
              {actionsContent}
            </div>
          )}
        </div>
      </div>
    </DfCard>
  )
}
