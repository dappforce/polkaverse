// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AvatarOrSkeleton } from 'src/components/utils'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInEmailButton.module.sass'

type Props = {
  setCurrentStep: (step: number) => void
}

const SignInEmailButton = ({ setCurrentStep }: Props) => {
  const handleClick = () => {
    setCurrentStep(StepsEnum.SignIn)
  }

  return (
    <div className={styles.SignInEmailButton} onClick={() => handleClick()}>
      <div className='d-flex align-items-center'>
        <AvatarOrSkeleton
          externalIcon
          icon={'/images/signIn/EmailIcon.svg'}
          size={'large'}
          className='mr-2 align-items-start'
        />
        <div className='font-weight-bold'>Sign in with email</div>
      </div>
      <div className={styles.SignInChip}>New</div>
    </div>
  )
}

export default SignInEmailButton
