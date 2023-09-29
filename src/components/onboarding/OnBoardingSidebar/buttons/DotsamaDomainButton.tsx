import Link from 'next/link'
import { useMyDomains } from 'src/rtk/features/domains/domainHooks'
import OnBoardingSidebarButton from '../OnBoardingSidebarButton'

export default function DotsamaDomainButton() {
  const { domains } = useMyDomains()
  if (domains.length > 0) return null
  return (
    <Link href='/dd' passHref legacyBehavior>
      <a className='d-block' target='_blank'>
        <OnBoardingSidebarButton
          className='w-100'
          emoji='🌎'
          text='Register a Subsocial Username'
        />
      </a>
    </Link>
  )
}
