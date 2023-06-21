// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PlayCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import clsx from 'clsx'
import { HTMLProps, useState } from 'react'
import { useIsUsingEmail } from 'src/components/auth/MyAccountsContext'
import useAccountName from 'src/components/profiles/hooks/useAccountName'
import config from 'src/config'
import { useOpenCloseEnableConfirmationModal } from 'src/rtk/features/confirmationPopup/useOpenCloseEnableConfirmationModal'
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

interface Props {
  steps: (keyof OnBoardingDataTypes)[]
}

function StepButton({ steps }: Props) {
  const openCloseOnBoardingModal = useOpenCloseOnBoardingModal()

  const isUsingEmail = useIsUsingEmail()

  const filteredSteps = isUsingEmail || !config.enableConfirmationLessMode ? steps.filter(step => step !== 'signer') : steps

  return (
    <>
      {filteredSteps.map(step => {
        const content = buttonTexts[step]
        return (
          content && (
            <OnBoardingSidebarButton
              key={step}
              onClick={() => {
                openCloseOnBoardingModal('open', {
                  toStep: step,
                  type: 'partial',
                })
              }}
              text={content.text}
              emoji={content.emoji}
            />
          )
        )
      })}
    </>
  )
}

export default function OnBoardingSidebar({
  hideOnBoardingSidebar,
  className,
  ...props
}: OnBoardingSidebarProps) {
  const [openQuickStart, setOpenQuickStart] = useState(false)
  const { steps } = useOnBoardingStepsOrder(true)

  const openCloseEnableConfirmationModal = useOpenCloseEnableConfirmationModal()

  const name = useAccountName()
  const { isOnBoardingSkipped } = useIsOnBoardingSkippedContext()
  const isUsingEmail = useIsUsingEmail()

  const showEnableConfirmationBtn = steps.includes('signer') ? false : true

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
        <StepButton steps={steps} />
        {showEnableConfirmationBtn && (
          <OnBoardingSidebarButton
            onClick={() => {
              openCloseEnableConfirmationModal('open')
            }}
            text={'Enable confirmation pop-ups'}
            emoji={'👌'}
          />
        )}
        <WritePostButton />
        {!isUsingEmail && <DotsamaDomainButton />}
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
