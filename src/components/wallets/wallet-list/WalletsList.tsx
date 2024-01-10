import { DownloadOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { StepsEnum } from 'src/components/auth/AuthContext'
import { setCurrentWallet } from 'src/components/auth/utils'
import config from 'src/config'
import { useMyAccountsContext } from '../../auth/MyAccountsContext'
import { setAccountsToState } from '../../auth/utils'
import { ButtonLink } from '../../utils/CustomLinks'
import { AvatarOrSkeleton, detectBrowser, getInstallUrl } from '../../utils/index'
import { showWarnMessage } from '../../utils/Message'
import { supportedWallets } from '../supportedWallets/index'
import { Wallet } from '../types'
import styles from './WalletList.module.sass'

export const CURRENT_WALLET = 'CurrentWalletName'

const { appName } = config

type GetWalletPorps = {
  setCurrentStep: (step: number) => void
}

const WalletList = ({ setCurrentStep }: GetWalletPorps) => {
  const { setAccounts } = useMyAccountsContext()
  const [unsubscribe, setUnsubscribe] = useState<() => unknown>()

  const browser = detectBrowser()

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe?.()
      }
    }
  })

  const onClick = async (wallet: Wallet) => {
    if (wallet.installed) {
      await wallet.enable(appName)

      if (wallet.enabled) {
        const unsub: any = await wallet.subscribeAccounts(async accounts => {
          if (accounts) {
            setAccountsToState(accounts, setAccounts)
            setCurrentStep(StepsEnum.SelectAccount)
            setCurrentWallet(wallet.extensionName)
          }
        })

        setUnsubscribe(unsub)
      }
    } else {
      showWarnMessage(
        `${wallet.title} extension is not installed or refresh the browser if ${wallet.title} is already installed`,
      )
    }
  }

  const sortedSupportedWallets = useMemo(() => {
    let installedWallet: (typeof supportedWallets)[number][] = []
    let notInstalledWallet: (typeof supportedWallets)[number][] = []
    supportedWallets.forEach(wallet => {
      if (wallet.installed) installedWallet.push(wallet)
      else notInstalledWallet.push(wallet)
    })
    return [...installedWallet, ...notInstalledWallet]
  }, [supportedWallets])

  const wallets = sortedSupportedWallets.map(wallet => {
    const { title, logo, installed, installUrls } = wallet

    const onInstallButtonClick = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
    }

    return (
      <div
        key={title}
        className={clsx(styles.WalletListItem, !installed && styles.Disabled)}
        onClick={() => installed && onClick(wallet)}
      >
        <div className='d-flex align-items-center'>
          <AvatarOrSkeleton
            externalIcon
            icon={logo.src}
            size={'large'}
            className='mr-2 align-items-start'
          />
          <div className='font-weight-bold'>{title}</div>
        </div>
        {!installed && browser !== 'Unknown' && (
          <Tooltip
            title={`Install ${title} or refresh the browser if ${title} is already installed`}
          >
            <ButtonLink
              href={getInstallUrl(installUrls)}
              target='_blank'
              className={styles.InstallButton}
              onClick={onInstallButtonClick}
            >
              <DownloadOutlined />
            </ButtonLink>
          </Tooltip>
        )}
      </div>
    )
  })

  return <>{wallets}</>
}

export default WalletList
