import { NextPageContext } from 'next'
import React from 'react'
import config from 'src/config'

const { appBaseUrl } = config

const createRobotsTxt = () => `
  User-agent: *
  Disallow: /*/new$
  Disallow: /*/*/new$
  Disallow: /*/edit$
  Disallow: /*/*/edit$
  Disallow: /sudo
  Disallow: /feed
  Disallow: /notifications
  Disallow: /accounts/*
  Allow: /*.css
  Allow: /*.js
  Allow: /*.jpg
  Allow: /*.jpeg
  Allow: /*.gif
  Allow: /*.svg
  Allow: /*.png
  Allow: /*.webp

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
