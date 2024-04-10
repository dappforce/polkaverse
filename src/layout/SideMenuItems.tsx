import React from 'react'
import { BiChat, BiNews } from 'react-icons/bi'
import { LuCompass } from 'react-icons/lu'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'
import { TbCoins, TbWorld } from 'react-icons/tb'
import { TiFlashOutline } from 'react-icons/ti'
import { LocalIcon, SubIcon } from 'src/components/utils'
import { getIsLoggedIn } from 'src/stores/my-account'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  href: string
  icon: React.ReactNode
  hidden?: boolean
  openInNewTab?: boolean
  forceHardNavigation?: boolean

  // Helpers
  isNotifications?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider => item === Divider

export const isPageLink = (item: MenuItem): item is PageLink => !isDivider(item)

export const buildAuthorizedMenu = (myAddress?: string): MenuItem[] => {
  return [
    {
      name: 'Feed',
      icon: <SubIcon Icon={BiNews} />,
      href: '/',
    },
    {
      name: 'Chat',
      icon: <SubIcon Icon={BiChat} />,
      href: '/c',
      forceHardNavigation: true,
    },
    ...(getIsLoggedIn()
      ? [
          {
            name: 'My Spaces',
            icon: <SubIcon Icon={LuCompass} />,
            href: `/accounts/${myAddress}/spaces`,
          },
        ]
      : []),
    Divider,
    {
      name: 'Content Staking',
      icon: <SubIcon Icon={TbCoins} />,
      href: '/c/staking',
      forceHardNavigation: true,
    },
    {
      name: 'Leaderboard',
      icon: <SubIcon Icon={MdOutlineLeaderboard} />,
      href: '/leaderboard',
    },
    {
      name: 'Statistics',
      icon: <SubIcon Icon={RiLineChartLine} />,
      href: '/stats',
    },
    Divider,
    {
      name: 'Usernames',
      icon: <SubIcon Icon={TbWorld} />,
      href: '/dd',
    },
    {
      name: 'Energy Station',
      icon: <SubIcon Icon={TiFlashOutline} />,
      href: '/energy',
    },
    Divider,
    {
      name: 'What is Grill?',
      icon: <LocalIcon path={'/icons/grill-grey.svg'} />,
      href: '/c/landing',
      forceHardNavigation: true,
    },
  ]
}
