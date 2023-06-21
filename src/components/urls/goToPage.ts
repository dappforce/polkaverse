// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import Router from 'next/router'
import { AnyId } from 'src/types'
import { HasSpaceIdOrHandle } from '.'
import { createNewPostLinkProps } from '../spaces/helpers'

const log = newLogger('Go to page')

export function goToSpacePage(spaceId: AnyId, isFirstSpace?: boolean) {
  const params = isFirstSpace ? '?isFirst' : ''

  Router.push('/[spaceId]', `/${spaceId.toString()}${params}`).catch(err =>
    log.error('Failed to redirect to "View Space" page:', err),
  )
}

export function goToNewPostPage(space?: HasSpaceIdOrHandle) {
  const { href, as } = createNewPostLinkProps(space)
  Router.push(href, as).catch(err => log.error('Failed to redirect to "New Post" page:', err))
}
