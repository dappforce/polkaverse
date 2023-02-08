import dayjs, { Dayjs } from 'dayjs'
import { NextPageContext } from 'next'
import React from 'react'
import { postUrl, spaceUrl } from 'src/components/urls'
import { fullUrl } from 'src/components/urls/helpers'
import config from 'src/config'
import { HasCreated } from 'src/types'

import { BN } from 'bn.js'
import {
  getLatestPostId,
  getLatestSpaceId,
  getPostsData,
  getProfileSpaceCount,
  getSpacesData,
} from 'src/graphql/apis'
import { getApolloClient } from 'src/graphql/client'
import {
  approxCountOfPostPages,
  approxCountOfSpacePages,
  getReversePageOfPostIds,
  getReversePageOfSpaceIds,
  ParsedPaginationQuery,
  parsePageQuery,
} from '../utils/getIds'

const { seoSitemapLastmod, seoSitemapPageSize } = config

/** See https://www.sitemaps.org/protocol.html#changefreqdef */
type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

/** See https://www.sitemaps.org/protocol.html#urldef */
type UrlItem = {
  loc: string
  lastmod?: Dayjs
  changefreq?: ChangeFreq
  /** From 0.0 to 1.0 */
  priority?: number
}

type ResourceType = 'profiles' | 'spaces' | 'posts'

type HasCreatedOrUpdated = Pick<HasCreated, 'createdAtTime'>

const getLastModFromStruct = ({ createdAtTime }: HasCreatedOrUpdated) => {
  const structTime = createdAtTime
  const lastUpdateFromStruct = dayjs(structTime)
  return seoSitemapLastmod && lastUpdateFromStruct.isBefore(seoSitemapLastmod)
    ? dayjs(seoSitemapLastmod)
    : lastUpdateFromStruct
}

function todayLastmod() {
  return dayjs().startOf('day').format('YYYY-MM-DD')
}

type ResourceSitemapIndex = {
  resource: ResourceType
  totalPages: number
}

/**
 * Sitemap file must have no more than 50,000 URLs and must be no larger than 50 MB.
 *
 * See https://www.sitemaps.org/protocol.html#sitemapIndexXMLExample
 */
function renderSitemapIndexOfResource({ resource, totalPages }: ResourceSitemapIndex) {
  const lastmod = todayLastmod()
  const items: string[] = []

  for (let page = 1; page <= totalPages; page++) {
    const loc = `/sitemap/${resource}/urlset.xml?page=${page}`
    items.push(`
      <sitemap>
        <loc>${fullUrl(loc)}</loc>
        <lastmod>${lastmod}</lastmod>
      </sitemap>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items.join('\n')}
    </sitemapindex>`
}

/**
 * Sitemap index files may not list more than 50,000 sitemaps
 * and must be no larger than 50 MB.
 *
 * See https://www.sitemaps.org/protocol.html
 */
function renderUrlSet(items: UrlItem[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${items
        .map(
          ({ loc, lastmod, changefreq }) => `
        <url>
          <loc>${fullUrl(loc)}</loc>
          ${lastmod ? `<lastmod>${lastmod.format('YYYY-MM-DD')}</lastmod>` : ''}
          ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
        </url>`,
        )
        .join('\n')}
    </urlset>`
}

function sendXml({ res }: NextPageContext, xml: string) {
  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(xml)
    res.end()
  }
}

const getPageAndSize = (props: NextPageContext): ParsedPaginationQuery => {
  const { page } = parsePageQuery(props.query)
  return { page, size: seoSitemapPageSize }
}

async function getNextSpaceId() {
  const client = getApolloClient()
  const latestSpaceId = await getLatestSpaceId(client)
  const nextSpaceId = new BN(latestSpaceId).add(new BN(1))
  return nextSpaceId
}

async function getNextPostId() {
  const latestPostId = await getLatestPostId(getApolloClient())
  const nextPostId = new BN(latestPostId).add(new BN(1))
  return nextPostId
}

export class SpacesSitemapIndex extends React.Component {
  static async getInitialProps(props: NextPageContext) {
    const query = getPageAndSize(props)
    const nextSpaceId = await getNextSpaceId()
    const totalPages = approxCountOfSpacePages(nextSpaceId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'spaces', totalPages })
    sendXml(props, xml)
  }
}

export class PostsSitemapIndex extends React.Component {
  static async getInitialProps(props: NextPageContext) {
    const query = getPageAndSize(props)
    const nextPostId = await getNextPostId()
    const totalPages = approxCountOfPostPages(nextPostId, query)
    const xml = renderSitemapIndexOfResource({ resource: 'posts', totalPages })
    sendXml(props, xml)
  }
}

export class ProfilesSitemapIndex extends React.Component {
  static async getInitialProps(props: NextPageContext) {
    const { size } = getPageAndSize(props)
    const accountWithProfileSpaceCount = await getProfileSpaceCount(getApolloClient())
    const totalPages = Math.ceil(accountWithProfileSpaceCount / size)
    const xml = renderSitemapIndexOfResource({ resource: 'profiles', totalPages })
    sendXml(props, xml)
  }
}

export class SpacesUrlSet extends React.Component {
  static async getInitialProps(props: NextPageContext) {
    const query = getPageAndSize(props)
    const client = getApolloClient()
    const nextSpaceId = await getNextSpaceId()

    const ids = getReversePageOfSpaceIds(nextSpaceId, query)
    const spaces = await getSpacesData(client, { where: { id_in: ids.map(id => id.toString()) } })
    spaces.sort((a, b) => {
      return new Date(b.createdAtTime).getTime() - new Date(a.createdAtTime).getTime()
    })

    const items: UrlItem[] = []

    spaces.forEach(space => {
      const spaceLoc = spaceUrl(space)
      const lastmod = getLastModFromStruct(space)
      items.push(
        {
          loc: spaceLoc,
          changefreq: 'daily',
          lastmod,
        },
        {
          loc: `${spaceLoc}/about`,
          changefreq: 'weekly',
          lastmod,
        },
      )
    })

    sendXml(props, renderUrlSet(items))
  }
}

export class PostsUrlSet extends React.Component {
  static async getInitialProps(props: NextPageContext) {
    const query = getPageAndSize(props)
    const client = getApolloClient()

    const nextPostId = await getNextPostId()
    const ids = getReversePageOfPostIds(nextPostId, query)
    const posts = await getPostsData(client, {
      where: { id_in: ids.map(id => id.toString()), hidden_eq: false },
    })

    const items: UrlItem[] = posts.map(post => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        loc: postUrl(space!.struct, post),
        lastmod: getLastModFromStruct(post.struct),
        changefreq: 'weekly',
      }
    })

    sendXml(props, renderUrlSet(items))
  }
}
