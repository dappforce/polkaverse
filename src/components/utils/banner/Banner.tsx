import { CloseOutlined } from '@ant-design/icons'
import { Col, Row } from 'antd'
import Link from 'next/link'
import React, { CSSProperties, useState } from 'react'
import store from 'store'
import { useIsMobileWidthOrDevice } from '../../responsive/ResponsiveContext'
import { ButtonLink } from '../CustomLinks'
import styles from './Banner.module.sass'

type BannerProps = {
  /**
   * A unique banner id that will be used to keep track of a state of a `hidden: boolean`
   * state of this banner in a local storage.
   */
  uid: string
  desktopImg: string
  mobileImg?: string
  title: string
  desc?: string
  fontSize: string
  color?: string
  textAlign?: 'center' | 'end' | 'start'
  blick?: boolean
  targetLink: string
  closable?: boolean
}

const BANNER_STORAGE_KEY = 'df.banner'

export const Banner = (props: BannerProps) => {
  const {
    uid,
    desktopImg,
    mobileImg = desktopImg,
    targetLink,
    closable = true,
    desc,
    color,
    fontSize: initialFontSize,
    textAlign,
    blick = false,
    title,
  } = props

  const isMobile = useIsMobileWidthOrDevice()

  const bannerFromStorage = store.get(BANNER_STORAGE_KEY)

  const [bannerState, setBannerState] = useState(bannerFromStorage)

  const isBannerClosed = bannerState?.hidden && bannerState?.id === uid

  if (isBannerClosed) return null

  const fontSize = isMobile && initialFontSize ? '0.8rem' : initialFontSize // TODO I dont undestand this code @Oleh
  const img = isMobile ? mobileImg : desktopImg

  const styleObj: CSSProperties = {
    background: `url(${img})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }

  const closeBanner = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    const banner = { id: uid, hidden: true }
    setBannerState(banner)
    store.set(BANNER_STORAGE_KEY, banner)
  }

  const content = (
    <>
      <div style={{ fontSize, color, textAlign, fontWeight: 'bold' }} className={styles.DfTitle}>
        {title}
      </div>
      <div style={{ fontSize, color, textAlign }} className={styles.DfDesc}>
        {desc}
      </div>
    </>
  )

  const closeButton = closable && (
    <CloseOutlined className={styles.DfCloseButton} style={{ fontSize }} onClick={closeBanner} />
  )

  return (
    <Link href={targetLink} as={targetLink}>
      {isMobile ? (
        <section className={styles.DfBanner} style={styleObj}>
          {closeButton}
          {content}
        </section>
      ) : (
        <section className={styles.DfBanner} style={styleObj}>
          <Row justify='space-between'>
            <Col span={18} className={styles.DfText}>
              {content}
            </Col>

            <Col span={6} className={styles.DfActionButton}>
              <Row align='middle' justify='end'>
                <ButtonLink href={targetLink} size={'large'} className={blick ? 'DfBlick' : ''}>
                  Claim Space
                </ButtonLink>
                {closeButton}
              </Row>
            </Col>
          </Row>
        </section>
      )}
    </Link>
  )
}
