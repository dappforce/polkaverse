import clsx from 'clsx'
import styles from './NameChip.module.sass'

export default function NameChip({ ...props }) {
  return <div {...props} className={clsx(styles.Chip)} />
}
