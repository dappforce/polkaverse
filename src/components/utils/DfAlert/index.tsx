import { InfoCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MutedSpan } from '../MutedText'
import styles from './index.module.sass'

const alertTypes = {
  info: {
    className: styles.Info,
    icon: <InfoCircleOutlined />,
    desktopStyle: { top: '4px' },
  },
  warning: {
    className: styles.Warning,
    icon: <InfoCircleOutlined />,
    desktopStyle: { top: '4px' },
  },
}

export interface DfAlertProps extends Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: string | JSX.Element
  desc?: string | JSX.Element
  icon?: JSX.Element
  alertType?: keyof typeof alertTypes
  showDefaultIcon?: boolean
}

export default function DfAlert({
  title,
  desc,
  icon,
  alertType = 'info',
  showDefaultIcon,
}: DfAlertProps) {
  const alertData = alertType && alertTypes[alertType]

  const displayedIcon = icon || (showDefaultIcon && alertData?.icon)
  return (
    <div className={clsx(styles.DfAlert, alertData?.className)}>
      {displayedIcon && (
        <div className={styles.Icon} style={alertData.desktopStyle}>
          {displayedIcon}
        </div>
      )}
      <div className={styles.Content}>
        {title && (
          <span className={styles.Title}>
            <span className={styles.MobileIcon}>{icon}</span>
            {title}
          </span>
        )}
        {desc && <MutedSpan className={styles.Desc}>{desc}</MutedSpan>}
      </div>
    </div>
  )
}
