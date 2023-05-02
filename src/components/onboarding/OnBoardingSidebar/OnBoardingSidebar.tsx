import { PlayCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import clsx from 'clsx'
import { HTMLProps, useState } from 'react'
import { useIsUsingEmailOrSigner } from 'src/components/auth/MyAccountsContext'
import useAccountName from 'src/components/profiles/hooks/useAccountName'
import config from 'src/config'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { OnBoardingDataTypes } from 'src/rtk/features/onBoarding/onBoardingSlice'
import { useIsOnBoardingSkippedContext } from '../contexts/IsOnBoardingSkippedContext'
import useOnBoardingStepsOrder from '../hooks/useOnBoardingStepsOrder'
import OnBoardingQuickStartModal from '../OnBoardingQuickStartModal'
import ContinueOnBoardingButton from './buttons/ContinueOnBoardingButton'
import DotsamaDomainButton from './buttons/DotsamaDomainButton'
import WritePostButton from './buttons/WritePostButton'
import styles from './OnBoardingSidebar.module.sass'
import OnBoardingSidebarButton from './OnBoardingSidebarButton'

type OnBoardingButtons = keyof OnBoardingDataTypes
const buttonTexts: {
  [key in OnBoardingButtons]?: {
    emoji: string
    text: string
  }
} = {
  topics: {
    emoji: '🏄‍♂️',
    text: 'Choose your interests',
  },
  spaces: {
    emoji: '💫',
    text: 'Follow recommended spaces',
  },
  profile: {
    emoji: '👋',
    text: 'Create your profile',
  },
  energy: {
    emoji: '⚡',
    text: 'Get energy',
  },
  signer: {
    emoji: '🙅‍♂️',
    text: 'Remove confirmation pop-ups',
  },
}

export interface OnBoardingSidebarProps extends HTMLProps<HTMLDivElement> {
  hideOnBoardingSidebar: () => void
}

export default function OnBoardingSidebar({
  hideOnBoardingSidebar,
  className,
  ...props
}: OnBoardingSidebarProps) {
  const [openQuickStart, setOpenQuickStart] = useState(false)
  const steps = useOnBoardingStepsOrder(true)
  const openCloseOnBoardingModal = useOpenCloseOnBoardingModal()

  const name = useAccountName()
  const { isOnBoardingSkipped } = useIsOnBoardingSkippedContext()
  const isUsingEmailOrSigner = useIsUsingEmailOrSigner()

  return (
    <>
      <OnBoardingQuickStartModal open={openQuickStart} hide={() => setOpenQuickStart(false)} />
      <div className={clsx(styles.OnBoardingSidebar, className)} {...props}>
        <div className={styles.Welcome}>
          <span className='FontBig'>
            Welcome to {config.appName}, {name}!
          </span>
          <span className='mt-2'>Here are some things you can do on {config.appName}</span>
          <Button
            icon={<PlayCircleOutlined style={{ position: 'relative', top: '1px' }} />}
            onClick={() => setOpenQuickStart(true)}
            type='default'
            className={clsx(styles.Button, 'mt-3')}
            size='large'
          >
            Start a quick tour
          </Button>
        </div>
        {isOnBoardingSkipped && steps.length > 0 && <ContinueOnBoardingButton />}
        {steps.map(step => {
          const content = buttonTexts[step]
          return (
            content && (
              <OnBoardingSidebarButton
                key={step}
                onClick={() => openCloseOnBoardingModal('open', { toStep: step, type: 'partial' })}
                text={content.text}
                emoji={content.emoji}
              />
            )
          )
        })}
        <WritePostButton />
        {!isUsingEmailOrSigner && <DotsamaDomainButton />}
        <Tooltip
          title={
            <div className={clsx(styles.DismissTooltip, 'p-3')}>
              <span>
                You can return to the Quickstart at any time. To do this, open the menu on the right
                side by clicking on your profile avatar in the top right corner and select
                &quot;Show Quickstart&quot; to proceed.
              </span>
              <Button type='primary' className='mt-3' onClick={hideOnBoardingSidebar}>
                Got it!
              </Button>
            </div>
          }
          color='white'
          trigger='click'
        >
          <Button type='text' className='MutedText grey text'>
            Hide Quickstart
          </Button>
        </Tooltip>
      </div>
    </>
  )
}
