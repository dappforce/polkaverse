import {
  BookOutlined,
  BugOutlined,
  BulbOutlined,
  CompassOutlined,
  GlobalOutlined,
  LineChartOutlined,
  LinkOutlined,
  NotificationOutlined,
  PlusOutlined,
  StarOutlined,
} from '@ant-design/icons'
import React from 'react'
import { FaDiscord } from 'react-icons/fa'
import { FiTwitter } from 'react-icons/fi'
import { IoFlashOutline } from 'react-icons/io5'
import { accountUrl } from 'src/components/urls'
import { SubIcon } from 'src/components/utils'
import config from 'src/config'

const { enableSubnetMode, enableDomains } = config

const issuesUrl = 'https://github.com/dappforce/subsocial/issues'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  icon: React.ReactNode
  hidden?: boolean

  // Helpers
  isNotifications?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider => item === Divider

export const isPageLink = (item: MenuItem): item is PageLink => !isDivider(item)

export const DefaultMenu: MenuItem[] = [
  {
    name: 'Explore spaces',
    page: ['/spaces'],
    icon: <CompassOutlined />,
    hidden: enableSubnetMode,
  },
  // {
  //   name: 'Polkadot Apps',
  //   page: [ polkadotAppsUrl ],
  //   icon: <BlockOutlined />,
  // },
  // {
  //   name: 'PolkaStats explorer',
  //   page: [ polkaStatsUrl ],
  //   icon: <BlockOutlined />,
  // },
  {
    name: 'Statistics',
    page: ['/stats'],
    icon: <LineChartOutlined />,
  },
  Divider,
  {
    name: config.appName,
    page: [config.appBaseUrl],
    icon: <LinkOutlined />,
    hidden: !enableSubnetMode,
  },
  {
    name: 'Subsocial Twitter',
    page: ['https://twitter.com/subsocialchain'],
    icon: <SubIcon Icon={FiTwitter} />,
  },
  // {
  //   name: 'Official Telegram chat',
  //   page: ['https://t.me/Subsocial'],
  //   icon: <CommentOutlined />,
  // },
  {
    name: 'Subsocial Announcements',
    page: ['https://t.me/SubsocialNetwork'],
    icon: <NotificationOutlined />,
  },
  {
    name: 'Subsocial Discord',
    page: ['https://discord.gg/yU8tgHN'],
    icon: <SubIcon Icon={FaDiscord} />,
  },
  Divider,
  {
    name: 'Energy Station',
    page: ['/energy'],
    icon: <SubIcon Icon={IoFlashOutline} />,
  },
  Divider,
  {
    name: 'Suggest Feature',
    page: ['https://forms.gle/sdmMJN3n4sxyNTWW7'],
    icon: <BulbOutlined />,
  },
  {
    name: 'Report bug',
    page: [issuesUrl],
    icon: <BugOutlined />,
  },
]

export const buildAuthorizedMenu = (myAddress: string): MenuItem[] => {
  const account = { address: myAddress }

  return [
    {
      name: 'My subscriptions',
      page: ['/accounts/[address]/following', accountUrl(account, 'following')],
      icon: <StarOutlined />,
    },
    {
      name: 'My spaces',
      page: ['/accounts/[address]/spaces', accountUrl(account, 'spaces')],
      icon: <BookOutlined />,
    },
    {
      name: 'New space',
      page: ['/spaces/new', '/spaces/new'],
      icon: <PlusOutlined />,
    },
    {
      name: 'Subsocial Usernames',
      page: ['/dd', '/dd'],
      icon: <GlobalOutlined />,
      hidden: !enableDomains,
    },
    Divider,
    ...DefaultMenu,
  ]
}
