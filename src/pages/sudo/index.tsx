import { PageContent } from 'src/components/main/PageWrapper'
import CustomLink from 'src/components/referral/CustomLink'

const TITLE = 'Sudo'

const SudoPage = () => (
  <PageContent meta={{ title: TITLE }} title={TITLE}>
    <ul>
      <li>
        <CustomLink href='/sudo/forceTransfer' as='/sudo/forceTransfer'>
          forceTransfer
        </CustomLink>
      </li>
    </ul>
  </PageContent>
)

export default SudoPage
