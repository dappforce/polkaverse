// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PageContent } from 'src/components/main/PageWrapper'

type Props = {
  title: string
  html: string
}

/** Use this component carefully and not to oftern, because it allows to inject a dangerous HTML. */
export const HtmlPage = ({ title, html }: Props) => (
  <PageContent meta={{ title }}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </PageContent>
)

export default HtmlPage
