import clsx from 'clsx'
import { HeadMetaProps, PageContent } from '../main/PageWrapper'
import { MutedDiv } from '../utils/MutedText'
import styles from './Energy.module.sass'
import EnergyForm from './EnergyForm'
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
    <PageContent
      className='mt-4'
      meta={meta}
      creatorDashboardSidebarType={{ name: 'home-page', variant: 'posts' }}
    >
      <div className='d-flex justify-content-center'>
        <div className={clsx('SubsocialGradient mb-3', styles.Title)}>Energy Station</div>
      </div>
      <section className={styles.Intro}>
        <MutedDiv>{desc}</MutedDiv>
      </section>
      <EnergyForm />
      <FaqSection />
    </PageContent>
  )
}
