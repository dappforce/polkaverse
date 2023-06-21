// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import ReactMarkdown from 'react-markdown'

interface Props {
  source?: string
  className?: string
}

export const DfMd = ({ source, className = '' }: Props) => (
  <ReactMarkdown className={`markdown-body ${className}`} linkTarget='_blank'>
    {source?.replaceAll('(https://app.subsocial.network/ipfs', '(https://ipfs.subsocial.network') ??
      ''}
  </ReactMarkdown>
)
