// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { NextPageContext } from 'next'
import React from 'react'
import config from 'src/config'

const { appBaseUrl } = config

const createRobotsTxt = () => `
  User-agent: *
  Disallow: /_next/static/
  Disallow: /*/new$
  Disallow: /*/*/new$
  Disallow: /*/edit$
  Disallow: /*/*/edit$
  Disallow: /sudo
  Disallow: /feed
  Disallow: /notifications

  Sitemap: ${appBaseUrl}/sitemap/spaces/index.xml
  Sitemap: ${appBaseUrl}/sitemap/posts/index.xml
`

class Robots extends React.Component {
  public static async getInitialProps({ res }: NextPageContext) {
    if (res) {
      res.setHeader('Content-Type', 'text/plain')
      res.write(createRobotsTxt())
      res.end()
    }
  }
}

export default Robots
