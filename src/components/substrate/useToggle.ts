// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

// Copyright 2017-2020 @polkadot/react-hooks authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useState } from 'react'

// Simple wrapper for a true/false toggle
export default function useToggle(
  defaultValue = false,
): [boolean, () => void, (value: boolean) => void] {
  const [isActive, setActive] = useState(defaultValue)
  const toggleActive = useCallback((): void => setActive((isActive: boolean) => !isActive), [])

  return [isActive, toggleActive, setActive]
}
