// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useResponsiveSize } from './ResponsiveContext'

export * from './ResponsiveContext'

type Props = {
  children?: React.ReactNode | null | JSX.Element
}

export const Desktop = ({ children }: Props) => {
  const { isDesktop } = useResponsiveSize()
  return isDesktop ? children : null
}

export const Tablet = ({ children }: Props) => {
  const { isTablet } = useResponsiveSize()
  return isTablet ? children : null
}

export const Mobile = ({ children }: Props) => {
  const { isMobile } = useResponsiveSize()
  return isMobile ? children : null
}

export const Default = ({ children }: Props) => {
  const { isNotMobile } = useResponsiveSize()
  return isNotMobile ? children : null
}
