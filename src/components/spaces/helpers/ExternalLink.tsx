// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

type LinkProps = {
  url: string
  value: React.ReactNode
}

const ExternalLink = ({ url, value }: LinkProps) => (
  <a href={url} target='_blank' rel='noreferrer'>
    {value}
  </a>
)

export default ExternalLink
