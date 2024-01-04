import Link from 'next/link'
import { hasInjectedWallet } from 'src/utils/window'
import { AvatarOrSkeleton, isClientSide } from '../utils'
import { StepsEnum } from './AuthContext'
import styles from './WalletButton.module.sass'

type Props = {
  setCurrentStep: (step: number) => void
}

const WalletButton = ({ setCurrentStep }: Props) => {
  const handleClick = () => {
    setCurrentStep(StepsEnum.SelectAccount)
  }

  const isInMobileWalletBrowser = isClientSide() && hasInjectedWallet()
  if (!isInMobileWalletBrowser) {
    return (
      <Link passHref href='https://novawallet.io/'>
        <a className={styles.WalletButton} target='_blank'>
          <div className='d-flex align-items-center'>
            <AvatarOrSkeleton
              externalIcon
              icon={'/images/wallets/nova-wallet.jpeg'}
              size={'default'}
              className='mr-2 align-items-start'
            />
            <div className='font-weight-bold pl-1' style={{ color: 'black' }}>
              Install Nova Wallet
            </div>
          </div>
        </a>
      </Link>
    )
  }

  return (
    <div className={styles.WalletButton} onClick={() => handleClick()}>
      <div className='d-flex align-items-center'>
        <AvatarOrSkeleton
          externalIcon
          icon={'/images/wallets/WalletIcon.svg'}
          size={'large'}
          className='mr-2 align-items-start'
        />
        <div className='font-weight-bold'>Connect wallet</div>
      </div>
    </div>
  )
}

export default WalletButton
