// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, ButtonProps } from 'antd'
import clsx from 'clsx'
import { AiOutlineRight } from 'react-icons/ai'
import styles from './OnBoardingSidebar.module.sass'

export interface OnBoardingButtonProps extends ButtonProps {
  emoji: string
  text: string
}

export default function OnBoardingSidebarButton({
  emoji,
  text,
  className,
  ...props
}: OnBoardingButtonProps) {
  return (
    <Button {...props} className={clsx(styles.ButtonOnBoarding, className)}>
      <span>{emoji}</span>
      <span className={styles.FullContent}>{text}</span>
      <AiOutlineRight />
    </Button>
  )
}
