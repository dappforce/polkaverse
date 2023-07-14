import clsx from 'clsx'
import { BareProps } from './types'

export const PrivacyPolicyLinks = ({ className }: BareProps) => (
  <div className={clsx('d-flex justify-content-center py-3', className)}>
    <a
      className='mr-2 DfBlackLink'
      target='_blank'
      rel='noreferrer'
      href='https://subsocial.network/legal/terms'
    >
      Terms of Use
    </a>
    {' · '}
    <a
      className='ml-2 DfBlackLink'
      target='_blank'
      rel='noreferrer'
      href='https://subsocial.network/legal/privacy'
    >
      Privacy Policy
    </a>
  </div>
)

export default PrivacyPolicyLinks
