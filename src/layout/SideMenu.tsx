import { Menu } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { HTMLProps } from 'react'
import CustomLink from 'src/components/referral/CustomLink'
import { useMyAddress } from '../components/auth/MyAccountsContext'
import { buildAuthorizedMenu, isDivider, PageLink } from './SideMenuItems'
import styles from './Sider.module.sass'

const renderPageLink = (item: PageLink) => {
  const { icon, openInNewTab } = item

  if (item.hidden) {
    return null
  }

  let anchorProps: HTMLProps<HTMLAnchorElement> = {}
  if (openInNewTab) {
    anchorProps = {
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return (
    <Menu.Item className='DfMenuItem' key={item.href}>
      <CustomLink href={item.href} passHref>
        <a {...anchorProps}>
          <span className='MenuItemIcon'>{icon}</span>
          <span className='MenuItemName'>{item.name}</span>
        </a>
      </CustomLink>
    </Menu.Item>
  )
}

function SideMenu({ noOffset }: { noOffset?: boolean }) {
  const { pathname } = useRouter()
  const myAddress = useMyAddress()

  const menuItems = buildAuthorizedMenu(myAddress)

  return (
    <div
      className={clsx(
        'd-flex flex-column justify-content-between h-100 w-100',
        styles.SiderOverflow,
      )}
    >
      <Menu
        selectedKeys={[pathname]}
        mode='inline'
        theme='light'
        className={clsx(styles.Menu, noOffset && styles.MenuNoOffset)}
        style={{ borderRight: 0, borderBottom: 0 }}
      >
        {menuItems.map((item, i) =>
          isDivider(item) ? (
            <Menu.Divider key={`divider-${i}`} className={styles.SiderDivider} />
          ) : (
            renderPageLink(item)
          ),
        )}
        {/* {isNotMobile && showOnBoarding && !collapsed && <OnBoardingCard />} */}
        {/* {isLoggedIn && <Menu.Divider />} */}
        {/* {isLoggedIn && <MySubscriptions />} */}
      </Menu>
    </div>
  )
}

export default SideMenu
