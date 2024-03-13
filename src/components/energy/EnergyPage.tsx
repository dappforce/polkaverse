import { useMyAddress } from '../auth/MyAccountsContext'
import { HeadMetaProps, PageContent } from '../main/PageWrapper'
import styles from './Energy.module.sass'
import EnergyForm from './EnergyForm'
import EnergyStats from './EnergyStats'
import { FaqSection } from './Faq'
import QuestionSection from './QuestionSection'

const desc =
  'Energy allows you to use Subsocial. You can create energy here by burning SUB, and see the approximate number of transactions it will allow you to complete.'

const meta: HeadMetaProps = {
  title: 'Energy Station',
  desc,
  image: '/images/energy-preview.png',
}

export const EnergyPage = () => {
  const myAddress = useMyAddress()

  return (
    <PageContent className={styles.EnergyStationLayout} meta={meta}>
      <div className={styles.LeftSideLayout}>
        <div className={styles.TitleSection}>
          <div className={styles.Title}>Energy Station</div>
          <div className={styles.Description}>{desc}</div>
        </div>
        {myAddress && <EnergyStats />}
        <EnergyForm />
      </div>
      <div className={styles.RightSideLayout}>
        <FaqSection />
        <QuestionSection />
      </div>
    </PageContent>
  )
}
