import { Button } from 'antd'
import React from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import config from 'src/config'
import { didSignIn } from 'src/rtk/features/accounts/myAccountSlice'
import { isBot, isServerSide } from '..'
import BasicInfoPanel from '../BasicInfoPanel'
import styles from './index.module.sass'

const LearnMoreButton = React.memo(() => (
  <Button
    href={config.landingPageUrl}
    target='_blank'
    ghost
    size='small'
    className={styles.DfActionButton}
  >
    Learn more
  </Button>
))

const InnerPanel = React.memo(() => {
  const { isMobile } = useResponsiveSize()

  const msg = isMobile
    ? `You are on ${config.appName}`
    : `You are on ${config.appName} – a social networking protocol on Polkadot & IPFS`

  return (
    <div className={styles.Wrapper}>
      <BasicInfoPanel
        className={styles.DfWhereAmIPanel}
        desc={msg}
        actions={[<LearnMoreButton key='learn-more' />]}
        closable
        centered
        banner={true}
        type='warning'
      />
    </div>
  )
})

export const WhereAmIPanel = () => {
  const doNotShow = isServerSide() || didSignIn() || isBot()
  return doNotShow ? null : <InnerPanel />
}
