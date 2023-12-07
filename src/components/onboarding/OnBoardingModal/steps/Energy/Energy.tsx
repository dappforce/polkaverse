import { Tabs } from 'antd'
import { useState } from 'react'
import { useAuth } from 'src/components/auth/AuthContext'
// import EnergyDiscordInstruction from 'src/components/energy/EnergyDiscordInstruction'
import EnergyForm from 'src/components/energy/EnergyForm'
import {
  useOnBoardingData,
  useOnBoardingModalOpenState,
  useSaveOnBoardingData,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../../types'
import styles from './Energy.module.sass'

// const { TabPane } = Tabs

type Tabs = 'burn-sub' | 'free-energy'
// const getTabKey = (key: Tabs) => key

export default function Energy({ ...props }: OnBoardingContentProps) {
  const {
    energy: { status },
  } = useAuth()
  const openState = useOnBoardingModalOpenState()
  const [selectedTab] = useState<Tabs>(
    'burn-sub' // !balance.isZero() ? 'burn-sub' : 'free-energy',
  )
  const [isDisabled, setIsDisabled] = useState(false)
  // const [isDiscordLinkClicked, setIsDiscordLinkClicked] = useState(false)

  const inputtedSubAmt = useOnBoardingData('energy')
  const saveInputtedSubAmt = useSaveOnBoardingData('energy')

  let disableSubmitBtn = false
  if (selectedTab === 'burn-sub') {
    disableSubmitBtn = isDisabled
  } else if (selectedTab === 'free-energy' && status === 'zero') {
    disableSubmitBtn = true
  }

  const withoutSubmitButton = openState === 'partial' && selectedTab === 'free-energy'

  return (
    <OnBoardingContentContainer
      {...props}
      disableSubmitBtn={disableSubmitBtn}
      // loadingSubmitBtn={isDiscordLinkClicked && disableSubmitBtn}
      hideSubmitBtn={withoutSubmitButton}
    >
      <div className={styles.Energy}>
        {/*<Tabs*/}
        {/*  className={styles.EnergyTab}*/}
        {/*  centered*/}
        {/*  activeKey={selectedTab}*/}
        {/*  onChange={tab => setSelectedTab(tab as Tabs)}*/}
        {/*>*/}
          <EnergyForm
            bordered={false}
            className={styles.EnergyForm}
            forSelfOnly
            subscribeValues={{
              setIsDisabled,
              setAmount: amount => saveInputtedSubAmt(amount ?? 0),
              amount: inputtedSubAmt,
              noButton: true,
            }}
          />
          {/*<TabPane tab='Get Free Energy' key={getTabKey('free-energy')}>*/}
          {/*  <EnergyDiscordInstruction*/}
          {/*    withWaitStep*/}
          {/*    className='FontNormal'*/}
          {/*    onDiscordLinkClick={() => setIsDiscordLinkClicked(true)}*/}
          {/*  />*/}
          {/*</TabPane>*/}
        {/*</Tabs>*/}
      </div>
    </OnBoardingContentContainer>
  )
}
