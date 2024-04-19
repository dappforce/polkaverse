import { Button, Modal, Row } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { twitterShareUrl } from 'src/components/urls'
import { ShareLink } from 'src/components/urls/helpers'
import { toShortAddress } from 'src/components/utils'
import BaseAvatar from 'src/components/utils/DfAvatar'
import { MutedSpan } from 'src/components/utils/MutedText'
import Segment from 'src/components/utils/Segment'
import { TextWithEmoji } from 'src/components/utils/TextWithEmoji'
import useGetProfileUrl from 'src/hooks/useGetProfileUrl'
import { useSelectProfile } from '../../rtk/features/profiles/profilesHooks'
import { useIsUsingEmail, useMyAccountsContext } from '../auth/MyAccountsContext'
import CustomLink from '../referral/CustomLink'
import { DonateCard } from './DonateModal'
import { TipContextWrapper, useTipContext } from './DonateModalContext'
import styles from './index.module.sass'
import { DonateProps } from './utils'

const SuccessContent = ({ recipientAddress }: DonateProps) => {
  const { amount, currency } = useTipContext()
  const { asPath } = useRouter()
  const profileData = useSelectProfile(recipientAddress)

  const recipientName = profileData?.content?.name || recipientAddress

  return (
    <div className='p-4'>
      <Row justify='center' align='middle'>
        <TextWithEmoji emoji='🎉' text='Thanks for your support!' className={clsx(styles.Title)} />
      </Row>
      <Row justify='center'>
        <div className={clsx('SubsocialGradient', styles.Title)}>{`${amount} ${currency}`}</div>
      </Row>
      <Row justify='center' className='mt-3'>
        <ShareLink
          url={twitterShareUrl(
            asPath,
            `I just tipped ${amount} $${currency} to ${recipientName} on @SubsocialChain`,
            { tags: ['SocialFinance', 'SoFi', 'donations'] },
          )}
        >
          <Button type='primary' block size='large'>
            Tweet about this
          </Button>
        </ShareLink>
      </Row>
    </div>
  )
}

const DonationModalBody = ({ recipientAddress }: DonateProps) => {
  const { success } = useTipContext()
  const Component = success ? SuccessContent : DonateCard

  return <Component recipientAddress={recipientAddress} />
}

export const Donate = ({ recipientAddress, renderButtonElement }: DonateProps) => {
  const [opened, setOpened] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const isUsingEmail = useIsUsingEmail()
  const { connectWallet } = useMyAccountsContext()
  useEffect(() => {
    if (opened) connectWallet()
  }, [opened])

  const open = () => {
    setOpened(true)
    setShowModal(true)
  }

  const hide = () => {
    setShowModal(false)
  }

  return (
    <>
      {opened && (
        <TipContextWrapper>
          <InnerModal hide={hide} recipientAddress={recipientAddress} showModal={showModal} />
        </TipContextWrapper>
      )}
      {renderButtonElement ? (
        renderButtonElement(open)
      ) : (
        <Button disabled={isUsingEmail} type='primary' onClick={open} className={clsx('mr-2')}>
          Tip
        </Button>
      )}
    </>
  )
}

const InnerModal = ({
  hide,
  recipientAddress,
  showModal,
}: {
  hide: () => void
  showModal: boolean
  recipientAddress: string
}) => {
  const { setSuccess } = useTipContext()

  const hideAndReset = () => {
    hide()
    setSuccess(false)
  }

  return (
    <Modal visible={showModal} footer={null} width={600} onCancel={hideAndReset}>
      <DonationModalBody recipientAddress={recipientAddress} />
    </Modal>
  )
}

export const DonationSection = ({ recipientAddress }: DonateProps) => {
  const isMobile = useIsMobileWidthOrDevice()
  const profileData = useSelectProfile(recipientAddress)
  const profileUrl = useGetProfileUrl(recipientAddress)

  const bgImg = `donation-bg${isMobile ? '-mobile' : ''}.png`

  return (
    <Segment
      className={styles.DonationSection}
      style={{ backgroundImage: `url(/images/${bgImg})` }}
    >
      <Row justify='center' className={styles.DonationContainer}>
        <Row justify='center'>
          <CustomLink passHref href={profileUrl}>
            <a>
              <BaseAvatar
                identityValue={recipientAddress}
                avatar={profileData?.content?.image}
                size={64}
              />
            </a>
          </CustomLink>
        </Row>
        <Row justify='center' className='my-2'>
          <MutedSpan>
            Enjoy this post? Support{' '}
            <CustomLink href={profileUrl}>
              {profileData?.content?.name || toShortAddress(recipientAddress)}
            </CustomLink>
            .
          </MutedSpan>
        </Row>
        <Row justify='center'>
          <Donate recipientAddress={recipientAddress} />
        </Row>
      </Row>
    </Segment>
  )
}
