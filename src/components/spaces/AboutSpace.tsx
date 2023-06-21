// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import { NextPage } from 'next'
import { useCallback, useState } from 'react'
import config from 'src/config'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { SpaceContent } from 'src/types'
import { PageContent } from '../main/PageWrapper'
import { ProfilePreviewByAccountId } from '../profiles/address-views'
import { InfoPanel } from '../profiles/address-views/InfoSection'
import { aboutSpaceUrl } from '../urls'
import { DfMd } from '../utils/DfMd'
import Section from '../utils/Section'
import Segment from '../utils/Segment'
import ViewTags from '../utils/ViewTags'
import { SpaceNotFountPage, useIsUnlistedSpace } from './helpers'
import { loadSpaceOnNextReq } from './helpers/loadSpaceOnNextReq'
import { EmailLink, SocialLink } from './SocialLinks/ViewSocialLinks'
import { ViewSpace } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'

const { appName } = config

type Props = ViewSpaceProps

export const InnerAboutSpacePage: NextPage<Props> = ({ spaceData }) => {
  const { struct: space } = spaceData!
  const { ownerId: spaceOwnerAddress } = space

  const [content] = useState(spaceData?.content || ({} as SpaceContent))
  const { name, about, image, tags, links = [], email } = content

  const ContactInfo = useCallback(() => {
    if (isEmptyArray(links) && isEmptyStr(email)) return null

    const socialLinks = (links as string[]).filter(nonEmptyStr).map((x, i) => ({
      value: <SocialLink key={`${name}-socialLink-${i}`} link={x} label={name} />,
    }))

    nonEmptyStr(email) && socialLinks.push({ value: <EmailLink link={email} label={name} /> })

    return (
      <Section title={`${name} social links & contact info`} className='mb-4'>
        <InfoPanel column={2} items={socialLinks} />
      </Section>
    )
  }, [])

  const title = `What is ${name}?`

  const meta = {
    title,
    desc: content.summary,
    image,
    canonical: aboutSpaceUrl(space),
  }

  return (
    <PageContent meta={meta} withOnBoarding>
      <Section level={1} title={title} className='DfContentPage'>
        {nonEmptyStr(about) && (
          <div className='DfBookPage'>
            <DfMd source={about} />
          </div>
        )}

        <ViewTags tags={tags} className='mb-4' />

        <ContactInfo />

        <Section title={`Owner of ${name} on ${appName}`} className='mb-4'>
          <Segment>
            <ProfilePreviewByAccountId address={spaceOwnerAddress} />
          </Segment>
        </Section>

        <Section title={`Follow ${name} on ${appName}`}>
          <ViewSpace
            spaceData={spaceData}
            withFollowButton
            withTags={false}
            withStats={true}
            preview
          />
        </Section>
      </Section>
    </PageContent>
  )
}

export const AboutSpacePage: NextPage<Props> = props => {
  const { statusCode, spaceData } = props

  if (useIsUnlistedSpace(spaceData) || statusCode === 404) {
    return <SpaceNotFountPage />
  }

  return <InnerAboutSpacePage {...props} />
}

getInitialPropsWithRedux(AboutSpacePage, async props => {
  const spaceData = await loadSpaceOnNextReq(props, aboutSpaceUrl)
  return { spaceData }
})

export default AboutSpacePage
