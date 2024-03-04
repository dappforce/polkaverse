import { CloseCircleOutlined, MenuOutlined, SearchOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import config from 'src/config'
import AuthorizationPanel from '../components/auth/AuthorizationPanel'
import SearchInput from '../components/search/SearchInput'
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext'

const { enableSearch, appLogo, mobileAppLogo, appName } = config

// import { useTheme } from 'next-themes'
import clsx from 'clsx'
import CustomLink from 'src/components/referral/CustomLink'

// const ThemeChanger = () => {
//   const { setTheme } = useTheme()

//   return (
//     <Switch
//       size='small'
//       onChange={(e) => e ? setTheme('polkaverse') : setTheme('subsocial')}
//   />
//   )
// }

const InnerMenu = () => {
  const { toggle } = useSidebarCollapsed()
  const { isNotMobile, isMobile } = useResponsiveSize()
  const [show, setShow] = useState(false)

  return isMobile && show ? (
    <div className='DfTopBar DfTopBar--search'>
      <SearchInput />
      <Tooltip title='Close search input' className='DfCloseSearchIcon'>
        <CloseCircleOutlined onClick={() => setShow(false)} />
      </Tooltip>
    </div>
  ) : (
    <div className='DfTopBar container'>
      <div className='DfTopBar--leftContent'>
        <MenuOutlined
          style={{ fontSize: '1rem', paddingLeft: '0.4rem', paddingRight: '0.4rem' }}
          onClick={toggle}
          className={clsx('DfBurgerIcon mr-2 xl-hidden', isMobile && 'mr-2')}
        />
        <CustomLink href='/' as='/'>
          <a className='DfBrand'>
            <img className='d-block' src={isMobile ? mobileAppLogo : appLogo} alt={appName} />
          </a>
        </CustomLink>
      </div>
      {isNotMobile && enableSearch && <SearchInput />}
      <div className='DfTopBar--rightContent'>
        {isMobile && enableSearch && (
          <SearchOutlined className='DfSearchIcon DfHoverIcon' onClick={() => setShow(true)} />
        )}
        {/* <ThemeChanger /> */}
        <AuthorizationPanel />
      </div>
    </div>
  )
}

export default InnerMenu
