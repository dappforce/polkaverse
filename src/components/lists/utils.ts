// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'

type ParamsHookProps = {
  triggers?: any[]
  defaultSize: number
}

export const useLinkParams = ({ triggers = [], defaultSize }: ParamsHookProps) => {
  const { pathname, asPath } = useRouter()

  return useCallback(
    (page: number, currentSize?: number) => {
      const size = currentSize || defaultSize
      const sizeParam = size && size !== DEFAULT_PAGE_SIZE ? `&size=${size}` : ''
      const pageParam = page !== DEFAULT_FIRST_PAGE ? `page=${page}` : ''
      const params = `${pageParam}${sizeParam}`
      const query = params ? `?${params}` : ''
      return {
        href: `${pathname}${query}`,
        as: `${asPath.split('?')[0]}${query}`,
      }
    },
    [pathname, asPath, ...triggers],
  )
}
