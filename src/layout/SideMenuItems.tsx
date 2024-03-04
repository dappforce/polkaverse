import React from 'react'
import { BiChat, BiNews } from 'react-icons/bi'
import { LuCompass } from 'react-icons/lu'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'
import { TbCoins, TbWorld } from 'react-icons/tb'
import { TiFlashOutline } from 'react-icons/ti'
import { SubIcon } from 'src/components/utils'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  icon: React.ReactNode
  hidden?: boolean
  openInNewTab?: boolean

  // Helpers
  isNotifications?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider => item === Divider

export const isPageLink = (item: MenuItem): item is PageLink => !isDivider(item)

export const buildAuthorizedMenu = (myAddress?: string): MenuItem[] => {
  return [
    ...(myAddress
      ? [
          {
            name: 'Feed',
            icon: <SubIcon Icon={BiNews} />,
            page: ['/'],
          },
        ]
      : []),
    {
      name: 'Chat',
      icon: <SubIcon Icon={BiChat} />,
      page: ['/c/chats'],
    },
    ...(myAddress
      ? [
          {
            name: 'My Spaces',
            icon: <SubIcon Icon={LuCompass} />,
            page: ['/my-spaces'],
          },
        ]
      : []),
    Divider,
    {
      name: 'Content Staking',
      icon: <SubIcon Icon={TbCoins} />,
      page: ['/c/staking'],
    },
    {
      name: 'Leaderboard',
      icon: <SubIcon Icon={MdOutlineLeaderboard} />,
      page: ['/leaderboard'],
    },
    {
      name: 'Statistics',
      icon: <SubIcon Icon={RiLineChartLine} />,
      page: ['/stats'],
    },
    Divider,
    {
      name: 'Usernames',
      icon: <SubIcon Icon={TbWorld} />,
      page: ['/dd'],
    },
    {
      name: 'Energy Station',
      icon: <SubIcon Icon={TiFlashOutline} />,
      page: ['/energy'],
    },
  ]
}
