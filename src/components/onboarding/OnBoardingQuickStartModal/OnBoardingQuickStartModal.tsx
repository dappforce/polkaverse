// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button } from 'antd'
import { useEffect, useReducer } from 'react'
import CustomModal from 'src/components/utils/CustomModal'
import { MutedSpan } from 'src/components/utils/MutedText'
import PaginationIndicator from 'src/components/utils/PaginationIndicator'
import { ModalProps } from 'src/components/utils/types'
import config from 'src/config'

const steps = [
  {
    title: 'Create',
    image: '/images/onboarding/create-post.gif',
    texts: [
      'You can create short posts, full-length articles, or anything inbetween by using the built-in post creator.',
      'To create a new post, use the "New post" button. To switch to a more article-friendly mode, click "Full editor"',
    ],
  },
  {
    title: 'Read',
    image: '/images/onboarding/see-post.gif',
    texts: [
      'The main page contains your feed, a collection of posts from spaces and accounts that you follow.',
      'You can also view posts and spaces across the platform, and sort them by popularity, newest, and number of comments, or see a list curated by us.',
    ],
  },
  {
    title: 'Discuss',
    image: '/images/onboarding/comment.gif',
    texts: [
      `${config.appName} features nested comments, allowing for multi-level discussions and debates.`,
      'The notifications page alerts you when others interact with you, such as commenting on your posts, replying to your comments, or following your space.',
    ],
  },
  {
    title: 'Monetize',
    image: '/images/onboarding/monetize.gif',
    texts: [
      'Support your favorite creators and show your appreciation for their work!',
      "You can send tips after reading posts, or directly on a user's profile. They will always receive the full tip - there are no middlemen on Subsocial.",
    ],
  },
]

type StepActions =
  | { type: 'INCREASE' }
  | { type: 'DECREASE' }
  | { type: 'GOTO'; payload: number }
  | { type: 'RESET' }
const stepReducer = (step: number, action: StepActions) => {
  const maxStep = steps.length - 1
  const minStep = 0
  switch (action.type) {
    case 'INCREASE':
      if (step >= maxStep) return maxStep
      return step + 1
    case 'DECREASE':
      if (step <= minStep) return minStep
      return step - 1
    case 'RESET':
      return minStep
    case 'GOTO':
      return action.payload ?? step
    default:
      return step
  }
}

export default function OnBoardingQuickStartModal({ hide, open }: ModalProps) {
  const [currentStep, dispatch] = useReducer(stepReducer, 0)
  const { image, texts, title } = steps[currentStep]

  useEffect(() => {
    if (!open) dispatch({ type: 'RESET' })
  }, [open])

  const isLastStep = currentStep === steps.length - 1
  return (
    <CustomModal
      footer={
        <div className='mt-auto d-flex flex-column align-items-center'>
          <PaginationIndicator
            style={{ marginBottom: '2.5rem' }}
            currentPage={currentStep}
            setCurrentPage={page => dispatch({ type: 'GOTO', payload: page })}
            totalPage={steps.length}
          />
          <div className='d-flex align-items-center w-100 GapNormal'>
            <Button
              size='large'
              block
              disabled={currentStep === 0}
              onClick={() => dispatch({ type: 'DECREASE' })}
            >
              Back
            </Button>
            <Button
              size='large'
              block
              type='primary'
              onClick={() => {
                if (isLastStep) hide()
                else dispatch({ type: 'INCREASE' })
              }}
            >
              {isLastStep ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      }
      fullHeight
      visible={open}
      onCancel={hide}
      title={title}
    >
      <img className='w-100 mb-3' src={image} />
      {texts.map(text => (
        <MutedSpan className='mb-2' key={text}>
          {text}
        </MutedSpan>
      ))}
    </CustomModal>
  )
}
