// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import HtmlPage from 'src/components/utils/HtmlPage'
import html from './terms.md'

export default React.memo(() => <HtmlPage html={html} title='Terms of Use' />)
