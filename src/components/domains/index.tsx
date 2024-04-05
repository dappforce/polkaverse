import { ShoppingCartOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import clsx from 'clsx'
import router from 'next/router'
import { useEffect, useState } from 'react'
import { DomainServerProps } from 'src/pages/dd'
import { useFetchDomainPendingOrdersByAccount } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { useMyDomains } from 'src/rtk/features/domains/domainHooks'
import { useFetchSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import { BannerCardWithWrapper } from '../creators/cards/SupportCreatorsCard'
import { PageContent } from '../main/PageWrapper'
import { useIsMobileWidthOrDevice } from '../responsive'
import useSubstrate from '../substrate/useSubstrate'
import { Loading } from '../utils'
import CardWithContent from '../utils/cards/CardWithContent'
import DfAlert from '../utils/DfAlert'
import DomainForm from './DomainInput'
import { EligibleDomainsSection } from './EligibleDomainsSection'
import { FaqSection } from './Faq'
import styles from './index.module.sass'
import { ManageDomainProvider } from './manage/ManageDomainProvider'
import { MyDomainsCard } from './MyDomains'
import PendingOrdersSection from './pendingOrders'
import { DomainDetails, UnamesLearnMoreLink, useFetchNewDomains } from './utils'

const tabs = ['register', 'manage'] as const
type TabKey = (typeof tabs)[number]
const getTabKey = (tab: TabKey) => tab

const DomainMarketSection = ({ promoCode }: DomainServerProps) => {
  const [domain, setDomain] = useState<DomainDetails>()
  const myAddress = useMyAddress()
  const { domains } = useMyDomains()
  const { api, isApiReady, subsocial } = useSubstrate()
  useFetchNewDomains()

  const onSearchDomain = async (domain?: string) => {
    if (!domain) return
    const data = await subsocial.findDomain(domain)

    setDomain({
      id: domain,
      ...data,
    } as DomainDetails)
  }

  const [activeTab, setActiveTab] = useState(getTabKey('register'))

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if ((tabs as unknown as string[]).includes(hash)) setActiveTab(hash as TabKey)
  }, [])

  useEffect(() => {
    if (!myAddress) setActiveTab('register')
  }, [myAddress])

  if (!isApiReady) return <Loading label='Loading...' />

  const myDomainsCount = domains.length

  const maxPromoDomainsPerAccount =
    api?.consts.domains.maxDomainsPerAccount.toHuman() as unknown as number

  const canRegisterAccount = myDomainsCount < maxPromoDomainsPerAccount

  const getTabTitle = (title: string, count: number | undefined) => {
    const countText = ` (${count})`
    return `${title}${count ? countText : ''}`
  }

  const changeTab = (tab: string) => {
    router.push(`#${tab}`)
    setActiveTab(tab as TabKey)
  }

  return (
    <Tabs className={'mt-3'} onChange={changeTab} activeKey={activeTab}>
      <Tabs.TabPane className='fontSizeNormal' tab='Register' key={getTabKey('register')}>
        <div className='mt-3'>
          {canRegisterAccount ? (
            <div>
              {promoCode &&
                (promoCode !== 'invalid' ? (
                  <DfAlert
                    title='Free domain'
                    desc='Congratulations, you can get a free domain! Just enter the desired domain name and click "Search".'
                    icon={<div style={{ lineHeight: '1rem' }}>🎁</div>}
                    alertType='info'
                  />
                ) : (
                  <DfAlert
                    title='Promo code has been used already'
                    desc='Someone has used this promo code, please destroy it and ask the Subsocial team for a new one.'
                    icon={<div style={{ lineHeight: '1rem' }}>🥺</div>}
                    alertType='warning'
                  />
                ))}
              <DomainForm onChange={onSearchDomain} />
              {domain && <EligibleDomainsSection domain={domain} />}
            </div>
          ) : (
            <DfAlert
              showDefaultIcon
              alertType='warning'
              title={`Accounts are limited to ${maxPromoDomainsPerAccount} domains per account for now.`}
              desc={
                <span>
                  We will enable buying more domains in the future.{' '}
                  <a
                    href='#manage'
                    onClick={() => setActiveTab('manage')}
                    className='font-weight-bold'
                  >
                    Open my domains
                  </a>
                </span>
              }
            />
          )}
        </div>
      </Tabs.TabPane>
      {myAddress && myDomainsCount !== 0 && (
        <Tabs.TabPane
          disabled={!myAddress || myDomainsCount === 0}
          className='fontSizeNormal'
          tab={getTabTitle('Manage', myDomainsCount)}
          key={getTabKey('manage')}
        >
          <div className={clsx(styles.MyDomainsContainer)}>
            <MyDomainsCard />
          </div>
          <div className='d-flex justify-content-center mt-4'>
            <Button
              onClick={() => changeTab('register')}
              icon={<ShoppingCartOutlined />}
              type='primary'
            >
              Buy New Username
            </Button>
          </div>
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}

export const DomainRegisterPage = ({ promoCode }: DomainServerProps) => {
  const myAddress = useMyAddress()

  useFetchDomainPendingOrdersByAccount(myAddress)
  useFetchSellerConfig()

  const isMobile = useIsMobileWidthOrDevice()

  const rightPanelContent = (
    <>
      <PendingOrdersSection />
      <FaqSection />
      {/*<CardWithContent title='Tutorial' className='mt-4'>*/}
      {/*  <Embed link='https://www.youtube.com/watch?v=v3MTo_tt5Z0' />*/}
      {/*</CardWithContent>*/}
    </>
  )

  return (
    <ManageDomainProvider promoCode={promoCode}>
      <PageContent
        meta={{
          title: 'Register Your Subsocial Username',
          desc: 'Subsocial usernames is a decentralized naming system for Polkadot and Kusama ecosystems. Register your .sub username, etc.',
          image: '/images/dotsama-domains-preview.jpg',
        }}
        rightPanel={
          <div
            style={{ width: '275px', gap: '16px' }}
            className='d-flex flex-column align-items-stretch'
          >
            {isMobile ? null : (
              <BannerCardWithWrapper
                title='Transfer Usernames'
                subtitle={
                  <p className={clsx(styles.Subtitle, 'mb-3')}>
                    Send your usernames to your other accounts, or to other people on Grill!
                  </p>
                }
                imagePath='/images/creators/establish-your-brand.png'
                learnMoreHref='https://docs.subsocial.network/docs/tutorials/usernames#how-do-i-transfer-a-username-to-another-account'
                buttonLabel='View Tutorial'
                backgroundColor='#ECF1FF'
                titleColor='#0F172A'
                color='#ECF1FF'
              />
            )}
            {rightPanelContent}
          </div>
        }
      >
        <CardWithContent
          title='Subsocial Usernames'
          subtitle={
            <span>
              Here you can register a .sub username. Your username will be function as a
              human-readable name for your account.{' '}
              <UnamesLearnMoreLink className='font-weight-bold' />
            </span>
          }
        >
          <DomainMarketSection promoCode={promoCode} />
        </CardWithContent>
        <div className='mt-4'>{isMobile ? rightPanelContent : null}</div>
      </PageContent>
    </ManageDomainProvider>
  )
}

export default DomainRegisterPage
