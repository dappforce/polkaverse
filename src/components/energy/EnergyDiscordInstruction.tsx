import clsx from 'clsx'
import Link from 'next/link'
import { HTMLProps } from 'react'
import { getSubsocialDiscordLink } from 'src/utils/links'
import { useMyAddress } from '../auth/MyAccountsContext'
import CopyText from '../utils/CopyText'
import styles from './EnergyDiscordInstruction.module.sass'

export interface EnergyDiscordInstructionProps extends HTMLProps<HTMLDivElement> {
  withWaitStep?: boolean
  onDiscordLinkClick?: () => void
}

export default function EnergyDiscordInstruction({
  className,
  withWaitStep,
  onDiscordLinkClick,
  ...props
}: EnergyDiscordInstructionProps) {
  const myAddress = useMyAddress()

  return (
    <div className={clsx(styles.Container, className)} {...props}>
      <div className={styles.StepContainer}>
        <span className={styles.StepContainerText}>1. Copy the text below.</span>
        <CopyText text={`!energy ${myAddress}`} message='Copied!' />
      </div>
      <div className={styles.StepContainer}>
        <span>
          2. Paste the text into the energy-bot channel in our
          <strong>
            <Link passHref href={getSubsocialDiscordLink()} legacyBehavior>
              <a target='_blank' onClick={onDiscordLinkClick}>
                {' '}
                Discord
              </a>
            </Link>
          </strong>
          .
        </span>
      </div>
      {withWaitStep && (
        <div className={styles.StepContainer}>
          <span>
            3. Wait until the bot finishes sending you energy (~10 seconds after the bot confirms
            your command).
          </span>
        </div>
      )}
    </div>
  )
}
