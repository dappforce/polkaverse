import { Modal, ModalProps } from 'antd'
import clsx from 'clsx'
import { MutedSpan } from 'src/components/utils/MutedText'
import styles from './index.module.sass'

export interface CustomModalProps extends ModalProps {
  title?: string | JSX.Element
  subtitle?: string | JSX.Element
  footer?: JSX.Element
  contentClassName?: string
  footerClassName?: string
  fullHeight?: boolean
}

export default function CustomModal({
  title,
  subtitle,
  children,
  footer,
  className,
  contentClassName,
  footerClassName,
  fullHeight,
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
        <div className='d-flex flex-column w-100 mb-3 mr-4'>
          <h2 className={clsx(styles.CustomModalTitle)}>{title}</h2>
          {subtitle && <MutedSpan className={clsx(title && 'mt-1')}>{subtitle}</MutedSpan>}
        </div>
      )}
      <div className={clsx(styles.CustomModalContent, 'overflow-auto scrollbar', contentClassName)}>
        {children}
      </div>
      {footer && <div className={clsx('mt-4', footerClassName)}>{footer}</div>}
    </Modal>
  )
}
