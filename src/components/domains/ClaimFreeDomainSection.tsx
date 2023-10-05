import { Button } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import ClaimFreeDomainModal from './ClaimFreeDomainModal'
import { DomainProps } from './EligibleDomainsSection'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'

export const ClaimFreeDomainSection = ({ domain: { id: domain } }: DomainProps) => {
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const { promoCode } = useManageDomainContext()

  return (
    <div className='d-flex align-items-center'>
      <ClaimFreeDomainModal
        onCancel={() => setOpenConfirmation(false)}
        visible={openConfirmation}
        domain={domain}
        promoCode={promoCode}
      />
      <span className='font-weight-bold mr-2'>Free</span>
      <Button
        type='primary'
        size='middle'
        className={clsx(styles.DomainPrimaryButton)}
        onClick={() => setOpenConfirmation(true)}
      >
        <span style={{ position: 'relative', top: '-1px' }} className='mr-1'>
          🎁
        </span>
        Claim
      </Button>
    </div>
  )
}
