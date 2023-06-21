// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button } from 'antd'
import clsx from 'clsx'
import RememberMeButton from 'src/components/utils/OffchainSigner/RememberMeButton'

type ButtonGroupProps = {
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  loadingProxy: boolean
  setLoadingProxy: (loadingProxy: boolean) => void
  saveAsDraft: () => void
  offchainSigner: boolean
  onSuccess: () => void
  isPartial?: boolean
}

const ButtonGroup = ({
  isPartial,
  goToNextStep,
  loadingProxy,
  setLoadingProxy,
  saveAsDraft,
  offchainSigner,
  onSuccess,
}: ButtonGroupProps) => {
  return (
    <>
      <div className={clsx('DfButtonGroupRoot mt-4')}>
        <Button
          className={clsx('w-100')}
          size='large'
          onClick={() => {
            if (isPartial) goToNextStep({ forceTerminateFlow: true })
            goToNextStep()
          }}
        >
          No, I’m fine
        </Button>
        <RememberMeButton
          className={clsx('w-100')}
          type='primary'
          size='large'
          withSpinner={true}
          loading={loadingProxy}
          disabled={loadingProxy}
          onClick={() => {
            setLoadingProxy(true)

            saveAsDraft()
            if (offchainSigner) {
              goToNextStep()
            } else {
              setLoadingProxy(false)
            }
          }}
          onFailedAuth={() => setLoadingProxy(false)}
          onSuccessAuth={() => {
            setLoadingProxy(false)
            onSuccess()
            if (!isPartial) goToNextStep()
          }}
        />
      </div>
    </>
  )
}

export default ButtonGroup
