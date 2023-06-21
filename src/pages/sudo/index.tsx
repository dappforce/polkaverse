// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import { PageContent } from 'src/components/main/PageWrapper'

const TITLE = 'Sudo'

const SudoPage = () => (
  <PageContent meta={{ title: TITLE }} title={TITLE}>
    <ul>
      <li>
        <Link href='/sudo/forceTransfer' as='/sudo/forceTransfer'>
          forceTransfer
        </Link>
      </li>
    </ul>
  </PageContent>
)

export default SudoPage
