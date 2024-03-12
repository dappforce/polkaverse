import clsx from 'clsx'
import { HeadMetaProps, PageContent } from '../main/PageWrapper'
import { MutedDiv } from '../utils/MutedText'
import styles from './Energy.module.sass'
import EnergyForm from './EnergyForm'
import EnergyStats from './EnergyStats'
import { FaqSection } from './Faq'

const desc =
  'Energy allows you to use Subsocial. You can create energy here by burning SUB, and see the approximate number of transactions it will allow you to complete.'

const meta: HeadMetaProps = {
  title: 'Energy Station',
  desc,
  image: '/images/energy-preview.png',
}

export const EnergyPage = () => {
  return (
    <PageContent className={clsx(styles.EnergyStationLayout)} meta={meta}>
      <div className={styles.LeftSideLayout}>
        <div className={styles.TitleSection}>
          <div className={clsx(styles.Title)}>Energy Station</div>
          <MutedDiv>{desc}</MutedDiv>
        </div>
        <EnergyStats />
        <EnergyForm />
      </div>
      <FaqSection />
    </PageContent>
  )
}
