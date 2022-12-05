import styles from './index.module.sass'

import {
  FacebookOutlined,
  LinkedinOutlined,
  LinkOutlined,
  RedditOutlined,
  ShareAltOutlined,
  TwitterOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import { useState } from 'react'
import {
  copyUrl,
  facebookShareUrl,
  linkedInShareUrl,
  postUrl,
  redditShareUrl,
  twitterShareUrl,
} from 'src/components/urls'
import { Copy, ShareLink } from 'src/components/urls/helpers'
import { IconWithLabel } from 'src/components/utils'
import { FVoid } from 'src/components/utils/types'
import { PostWithSomeDetails, SpaceStruct } from 'src/types'
import SharePostLink from '../SharePostLink'

type ShareMenuProps = {
  postDetails: PostWithSomeDetails
  space?: SpaceStruct
  preview?: boolean
  title?: string
  className?: string
  onClick?: FVoid
}

export type SomeShareLink = {
  url: string
  title?: string
  summary?: string
}

const FacebookIcon = <FacebookOutlined />
const TwitterIcon = <TwitterOutlined />
const LinkedInIcon = <LinkedinOutlined />
const RedditIcon = <RedditOutlined />
const LinkIcon = <LinkOutlined />

const FacebookShareLink = ({ url }: SomeShareLink) => (
  <ShareLink url={facebookShareUrl(url)}>
    <IconWithLabel icon={FacebookIcon} label='Facebook' />
  </ShareLink>
)

const TwitterShareLink = ({ url, title }: SomeShareLink) => (
  <ShareLink url={twitterShareUrl(url, title)}>
    <IconWithLabel icon={TwitterIcon} label='Twitter' />
  </ShareLink>
)

const LinkedInShareLink = ({ url, title, summary }: SomeShareLink) => (
  <ShareLink url={linkedInShareUrl(url, title, summary)}>
    <IconWithLabel icon={LinkedInIcon} label='LinkedIn' />
  </ShareLink>
)

const RedditShareLink = ({ url, title }: SomeShareLink) => (
  <ShareLink url={redditShareUrl(url, title)}>
    <IconWithLabel icon={RedditIcon} label='Reddit' />
  </ShareLink>
)

const CopyLink = ({ url }: SomeShareLink) => (
  <Copy text={copyUrl(url)} message='Link copied'>
    <IconWithLabel icon={LinkIcon} label='Copy link' />
  </Copy>
)

const ShareMenu = (props: ShareMenuProps) => {
  const {
    postDetails: { post },
    space,
    onClick,
  } = props
  const currentPostUrl = postUrl(space, post)
  const title = post.content?.title
  const summary = post.content?.body

  return (
    <Menu selectable={false} mode='horizontal' className={styles.DfShareDropdown} onClick={onClick}>
      <Menu.ItemGroup title='Share to:'>
        <Menu.Item>
          <SharePostLink {...props} />
        </Menu.Item>
        <Menu.Item>
          <FacebookShareLink url={currentPostUrl} />
        </Menu.Item>
        <Menu.Item>
          <TwitterShareLink url={currentPostUrl} title={title} />
        </Menu.Item>
        <Menu.Item>
          <LinkedInShareLink url={currentPostUrl} title={title} summary={summary} />
        </Menu.Item>
        <Menu.Item>
          <RedditShareLink url={currentPostUrl} title={title} summary={summary} />
        </Menu.Item>
        <Menu.Item>
          <CopyLink url={currentPostUrl} />
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  )
}

const ShareIcon = <ShareAltOutlined />

export const ShareDropdown = (props: ShareMenuProps) => {
  const { preview, title = 'Share', className, postDetails } = props
  const {
    post: {
      struct: { sharesCount },
    },
  } = postDetails
  const [isVisible, setVisible] = useState(false)

  const hide = () => setVisible(false)

  return (
    <Dropdown
      visible={isVisible}
      onVisibleChange={setVisible}
      placement='bottomCenter'
      overlay={<ShareMenu onClick={hide} {...props} />}
    >
      <Button className={className} title={preview ? title : undefined}>
        <IconWithLabel
          icon={ShareIcon}
          count={sharesCount || 0}
          label={!preview ? title : undefined}
        />
      </Button>
    </Dropdown>
  )
}
