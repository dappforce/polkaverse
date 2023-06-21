// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { OpenAuthButton } from 'src/components/auth/AuthButtons'
import {
  useIsSignedIn,
  useMyAccountsContext,
  useMyAddress,
} from 'src/components/auth/MyAccountsContext'
import styles from './inputs.module.sass'
import { SelectAccountInput } from './SelectAccountInput'

type SignInButtonProps = {
  title: string
  ghost?: boolean
}

const btnClasses = clsx(
  styles.Button as string,
  styles.ButtonFontSize as string,
  'font-weight-bold',
)

const SignInButton = ({ title, ghost }: SignInButtonProps) => (
  <OpenAuthButton
    title={title}
    type='primary'
    className={btnClasses}
    block
    ghost={ghost}
    size='large'
  />
)

type SelectAccountWithLoginProps = {
  onChange?: (account: string) => void
}

export const SelectAccountWithLogin = ({ onChange }: SelectAccountWithLoginProps) => {
  const isSignedIn = useIsSignedIn()
  const account = useMyAddress()
  const { setAddress: setAccount } = useMyAccountsContext()

  const onAccountHandler = (account: string) => {
    setAccount(account)
    onChange && onChange(account)
  }

  return isSignedIn ? (
    <>
      <SelectAccountInput
        className={`${styles.Select} w-100`}
        setValue={onAccountHandler}
        value={account}
      />
    </>
  ) : (
    <SignInButton title='Connect wallet' />
  )
}
