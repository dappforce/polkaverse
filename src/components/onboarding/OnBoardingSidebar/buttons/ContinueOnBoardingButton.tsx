// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import {
  useAllOnBoardingData,
  useOpenCloseOnBoardingModal,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import useOnBoardingStepsOrder from '../../hooks/useOnBoardingStepsOrder'
import OnBoardingSidebarButton from '../OnBoardingSidebarButton'

export default function ContinueOnBoardingButton() {
  const openCloseModal = useOpenCloseOnBoardingModal()
  const allData = useAllOnBoardingData()
  const { steps: order } = useOnBoardingStepsOrder()

  const onClick = () => {
    const firstSkippedStep = order.find(currentStep => allData[currentStep]?.isDraft !== false)
    openCloseModal('open', {
      type: 'full-on-boarding',
      toStep: firstSkippedStep || order[0],
    })
  }

  return <OnBoardingSidebarButton onClick={onClick} text='Continue Onboarding' emoji='▶️' />
}
