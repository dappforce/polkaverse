import { Modal, ModalProps } from 'antd'
import clsx from 'clsx'
import { MutedSpan } from 'src/components/utils/MutedText'
import styles from './index.module.sass'

export interface CustomModalProps extends ModalProps {
  title?: string | JSX.Element | React.ReactNode
  subtitle?: string | JSX.Element
  footer?: JSX.Element
  contentClassName?: string
  contentElementId?: string
  footerClassName?: string
  fullHeight?: boolean
  noScroll?: boolean
}

export default function CustomModal({
  title,
  subtitle,
  children,
  footer,
  className,
  contentClassName,
  contentElementId,
  footerClassName,
  fullHeight,
  noScroll,
  ...props
}: CustomModalProps & {
  children: any
}) {
  return (
    <Modal
      footer={null}
      className={clsx(
        styles.CustomModalContainer,
        fullHeight && styles.CustomModalFullHeight,
        className,
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className={clsx('d-flex flex-column w-100 pr-4', subtitle ? 'pb-3' : 'pb-2')}>
          <h2 className={clsx(styles.CustomModalTitle)}>{title}</h2>
          {subtitle && <MutedSpan className={clsx(title && 'mt-1')}>{subtitle}</MutedSpan>}
        </div>
      )}
      <div
        className={clsx(
          styles.CustomModalContent,
          !noScroll && 'overflow-auto',
          'scrollbar',
          contentClassName,
        )}
        id={contentElementId}
      >
        {children}
      </div>
      {footer && <div className={clsx('mt-4', footerClassName)}>{footer}</div>}
    </Modal>
  )
}
