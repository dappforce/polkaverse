// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isBrowser as isBaseBrowser, isMobile as isBaseMobile, isTablet } from 'react-device-detect'

export const isMobileDevice = isBaseMobile || isTablet
export const isBrowser = isBaseBrowser

export const DEFAULT_AVATAR_SIZE = isMobileDevice ? 30 : 36
export const LARGE_AVATAR_SIZE = isMobileDevice ? 48 : 64

export const REGULAR_MODAL_HEIGHT = 60 // vh
